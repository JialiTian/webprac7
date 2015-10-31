use findfriends;
create table user
(
name varchar(100), 
fbid bigint(20) unsigned NOT NULL,
PRIMARY KEY (fbid)
);