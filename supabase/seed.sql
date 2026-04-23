insert into public.categories (name, slug, sort_order) values
  ('ACT I — RENAISSANCE',    'act-i',              1),
  ('ACT II — COWBOY CARTER', 'act-ii',             2),
  ('LEMONADE',               'lemonade',            3),
  ('BEYONCÉ',                'beyonce',             4),
  ('4',                       '4',                  5),
  ('DANGEROUSLY IN LOVE',    'dangerously-in-love', 6),
  ('ARCHIVE',                'archive',             7)
on conflict (slug) do nothing;
