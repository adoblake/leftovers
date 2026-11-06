import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const pg = new PGlite();
const admin = '00000000-0000-4000-8000-000000000001';
const coordinator = '00000000-0000-4000-8000-000000000002';
const analyst = '00000000-0000-4000-8000-000000000003';
const source = '00000000-0000-4000-8000-000000000101';
const noConsent = '00000000-0000-4000-8000-000000000102';
const donor = '00000000-0000-4000-8000-000000000103';
async function asRole(role: 'anon' | 'authenticated', user = '') {
  await pg.exec('reset role'); await pg.query("select set_config('request.jwt.claim.sub',$1,false)", [user]); await pg.exec(`set role ${role}`);
}
async function publish(sourceId = source, confirmed = true) {
  return pg.query(`insert into public.sponsors(source_interest_id,public_name,website,public_description,support_area,agreement_confirmed,published)
    values ($1,'Fictional Test Supporter','https://supporter.example.org','Approved fictional organizational acknowledgment.','Transport',$2,true) returning id`, [sourceId, confirmed]);
}
beforeAll(async () => {
  await pg.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
  for (const file of ['001_initial.sql','002_optional_contact_zip.sql','003_sponsorship.sql']) await pg.exec(readFileSync(`supabase/migrations/${file}`, 'utf8'));
  await pg.query('insert into auth.users(id) values ($1),($2),($3)', [admin, coordinator, analyst]);
  await pg.query("insert into public.profiles(id,role) values ($1,'admin'),($2,'coordinator'),($3,'analyst')", [admin, coordinator, analyst]);
  for (const [id, kind, consent] of [[source,'sponsor',true],[noConsent,'sponsor',false],[donor,'donor',false]] as const) {
    await pg.query(`insert into public.interests(id,kind,organization,name,email,zip,category,pounds,frequency,notes,consented_at,recognition_consent,status)
      values($1,$2,'Fictional Organization','Private Contact','private@example.org',$3,$4,0,'Unsure','Private inquiry notes',now(),$5,'Approved for planning')`, [id,kind,kind==='donor'?'85004':null,kind==='donor'?'Produce':'Not applicable',consent]);
  }
}, 30000);
afterEach(async () => { await pg.exec('reset role'); await pg.query("select set_config('request.jwt.claim.sub','',false)"); });
afterAll(async () => { await pg.close(); });

describe('PostgreSQL migrations and role policies', () => {
  it('denies anonymous access to personal contact records', async () => {
    await asRole('anon'); await expect(pg.query('select name,email from public.interests')).rejects.toMatchObject({ code: '42501' });
  });
  it('permits authorized contact review and excludes analysts', async () => {
    await asRole('authenticated',admin); expect((await pg.query('select email from public.interests')).rows).toHaveLength(3);
    await asRole('authenticated',coordinator); expect((await pg.query('select email from public.interests')).rows).toHaveLength(3);
    await asRole('authenticated',analyst); expect((await pg.query('select email from public.interests')).rows).toHaveLength(0);
  });
  it('prevents users from assigning themselves an administrator role', async () => {
    await asRole('authenticated',analyst); await expect(pg.query("update public.profiles set role='admin' where id=$1",[analyst])).rejects.toMatchObject({ code:'42501' });
  });
  it('permits status review but not rewriting recognition consent', async () => {
    await asRole('authenticated',coordinator);
    await pg.query("update public.interests set status='Under review' where id=$1",[noConsent]);
    await expect(pg.query('update public.interests set recognition_consent=true where id=$1',[noConsent])).rejects.toMatchObject({code:'42501'});
  });
  it('rejects publication without source permission', async () => {
    await asRole('authenticated',admin); await expect(publish(noConsent)).rejects.toMatchObject({code:'P0001'});
  });
  it('rejects publication before an agreement is confirmed', async () => {
    await asRole('authenticated',admin); await expect(publish(source,false)).rejects.toMatchObject({code:'23514'});
  });
  it('rejects publication by coordinators even when the inquiry has consent', async () => {
    await asRole('authenticated',coordinator); await expect(publish()).rejects.toMatchObject({code:'42501'});
  });
  it('publishes only safe organizational fields, then automatically removes a declined source', async () => {
    await asRole('authenticated',admin); await publish();
    await asRole('anon'); const result=await pg.query<Record<string,unknown>>('select * from public.sponsor_directory');
    expect(result.rows).toHaveLength(1); expect(Object.keys(result.rows[0])).toEqual(['id','public_name','website','public_description','support_area']);
    expect(JSON.stringify(result.rows)).not.toContain('private@example.org');
    await expect(pg.query('select source_interest_id from public.sponsors')).rejects.toMatchObject({code:'42501'});
    await asRole('authenticated',admin); await pg.query("update public.interests set status='Declined' where id=$1",[source]);
    await asRole('anon'); expect((await pg.query('select * from public.sponsor_directory')).rows).toHaveLength(0);
  });
  it('automatically removes a public acknowledgment when the operator withdraws consent', async () => {
    await asRole('authenticated',admin); await pg.query("update public.interests set status='Approved for planning' where id=$1",[source]);
    await pg.query('update public.sponsors set published=true where source_interest_id=$1',[source]);
    await pg.exec('reset role'); await pg.query('update public.interests set recognition_consent=false where id=$1',[source]);
    await asRole('anon');expect((await pg.query('select * from public.sponsor_directory')).rows).toHaveLength(0);
  });
  it('keeps sponsorship inquiries out of pickup planning', async () => {
    await asRole('authenticated',coordinator);
    await expect(pg.query("insert into public.pickups(interest_id,category,estimated_pounds) values($1,'Produce',10)",[source])).rejects.toMatchObject({code:'P0001'});
    await pg.query("insert into public.pickups(interest_id,category,estimated_pounds) values($1,'Produce',10)",[donor]);
  });
  it('keeps cost entry restricted to administrators', async () => {
    await asRole('authenticated',coordinator); await expect(pg.query("insert into public.operating_costs(category,amount,incurred_on) values('Test',0,current_date)")).rejects.toMatchObject({code:'42501'});
    await asRole('authenticated',admin); await pg.query("insert into public.operating_costs(category,amount,incurred_on) values('Test',0,current_date)");
  });
});
