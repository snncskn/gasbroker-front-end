# Barber
ng build
Canlı sisteme atarken main branch olduğundan olalım
calendart.comp içinde schedulerLicenseKey bilgisi açlacak,
.httaccess dosyası hariç hepsini atalım

# APPOINTMENT-FTP
92.204.220.58
21
app
app@appointment.teoden.co.uk
LVD-y]bD@[}h
# HAIRDRESSER-FTP
92.204.220.58
muzeyr@hairdresserapi.teoden.co.uk
m!350951KeM
# Aktarım insert sql

INSERT INTO appointment(agent_id,customer_id,description,start,end,price,minute,active,status,service)
SELECT 
(select id from users where userName = o.booked) as agent_id,
(select max(id) from customers where card_name = o.customer) as customer_id,
'' as descr,
concat(REPLACE(replace(o.app_date,'.','-'),'  ','T'),':00.000Z') AS start,
concat(REPLACE(replace(o.app_date,'.','-'),'  ','T'),':00.000Z') AS end,
price,
minute,1,'success',new_service FROM appointment_old o WHERE 1



# ürün insert sql
insert into products (product_name,price,uid,minute )
select new_service ,REPLACE (price,',','.'),'9999','60' from appointment_old  group by new_service,price 
 
 # randevu detay

INSERT INTO appointment_detail(appointment_id,product_id) 
select id,product_id from appointment   where product_id !=0



# kalanlar
takvimde saat dilimi 12 lik olarakgeliyor,
24 saat olarak değiştirelim,
history bilgsini tersden sıralayalım.
çalışma saatlerini ekle,




time breakların çalışır hale getirilmesi,
time zone kontrol edilecek,

gün view'indayken 23 June ile birlikte gün bilgisni yazalım


# httacesss
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} -s [OR]
RewriteCond %{REQUEST_FILENAME} -l [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^.*$ - [NC,L]

RewriteRule ^(.*) /index.html [NC,L]




Tamamlananlar
ürün silme aşamasında kontrol koyalım index varsa silmesin,

disable edilen ürünleri listeden kaldırsın,
ÜRÜN DAKKA bilgisini değiştirdim ama güncellemedi kontrol edelim.

parçalı ödeme nakit ile 50 kredi akrtı ile 20 ödeyip tamamlayabilmeli,

evenv-view ekranında customer mail adresini de getirelim.
event-view üzerinde tasarımda kaymalar var,
calendaR'da kimi seçtiysem onun ismi seçili fgelmeli.   tamamlandı

Event-viewp
randevu tarih ve saat bilgisi arasında mesafe olsun,



