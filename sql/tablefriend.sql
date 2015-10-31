use findfriends;
create table friend
(
fbid1 bigint(20) unsigned NOT NULL DEFAULT 0, 
fbid2 bigint(20) unsigned NOT NULL DEFAULT 0,
visible enum('show','hide') DEFAULT 'show',
PRIMARY KEY (fbid1, fbid2)
);