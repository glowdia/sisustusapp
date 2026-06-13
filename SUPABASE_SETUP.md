# Sisustusapp - Supabase-käyttöönotto

Tämä ohje kuvaa, miten Supabase otetaan käyttöön tämän projektin backendiksi.

## 1. Luo Supabase-projekti

1. Luo uusi Supabase-projekti.
2. Valitse EU-alue, jos saatavilla.
3. Ota talteen:
   - Project URL
   - anon public key
   - service role key
   - project ref

## 2. Luo `.env.local`

Kopioi `.env.example` tiedostoksi `.env.local` ja täytä vähintään:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Älä koskaan vie `SUPABASE_SERVICE_ROLE_KEY`-arvoa selaimeen tai client-koodiin.

## 3. Aja ensimmäinen migraatio

Suositeltu tapa on käyttää Supabase CLI:tä.

```bash
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest db push
```

Jos CLI ei ole käytettävissä, migraation voi ensimmäisessä MVP-vaiheessa ajaa Supabasen SQL Editorissa kopioimalla tiedoston:

```text
supabase/migrations/202606120001_initial_foundation.sql
```

CLI on pidemmän päälle parempi, koska skeema pysyy versionhallinnassa ja muutokset ovat toistettavia.

## 4. Luo ensimmäinen organisaatio

Migraatio luo taulut, mutta ei vielä organisaatiota. Luo ensimmäinen organisaatio Supabasen SQL Editorissa:

```sql
insert into public.organizations (name)
values ('Sisustusapp sisäinen')
returning id;
```

Kopioi palautuva `id` `.env.local`-tiedostoon:

```bash
SEED_ORGANIZATION_ID=palautunut-uuid
```

## 5. Tuo tuotteet ja Tikkurila-värit

Kun migraatio on ajettu ja `SEED_ORGANIZATION_ID` on asetettu:

```bash
npm run db:import-catalog
```

Skripti:

- lukee `tuotelista-muokattu.csv`
- lukee `tikkurila_tunne_vari_2020.csv`
- poistaa kyseisen organisaation aiemmat CSV-lähteiset tuotteet
- lisää tuotteet `products`-tauluun lähteellä `csv`
- upserttaa Tikkurila-värit `paint_colors`-tauluun

## 6. Luo ensimmäinen käyttäjä

Käyttäjät luodaan Supabase Authissa.

MVP-vaiheen nopea tapa:

1. Luo käyttäjä Supabase Dashboardissa.
2. Lisää käyttäjän `auth.users.id` arvolla profiili:

```sql
insert into public.profiles (id, email, full_name, default_organization_id)
values (
  'AUTH_USER_ID',
  'email@example.com',
  'Käyttäjän nimi',
  'ORGANIZATION_ID'
);
```

3. Lisää käyttäjä organisaation jäseneksi:

```sql
insert into public.organization_members (organization_id, user_id, role)
values ('ORGANIZATION_ID', 'AUTH_USER_ID', 'owner');
```

Myöhemmin tämä automatisoidaan signup-/invite-virralla.

## 7. Tarkistus

Paikallisesti:

```bash
npm run ci
npm run dev
```

Supabaseen liittyviä RLS-testejä ei ole vielä toteutettu. Ne tehdään sen jälkeen, kun projekti on linkitetty ja testikäyttäjät/seed-data ovat olemassa.
