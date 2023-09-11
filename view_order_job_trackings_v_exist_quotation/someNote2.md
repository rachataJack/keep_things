อันนี้เรื่อง status การ์ด QBC-1234
cart_order_no           data.code
install conf               
cont no view    CO2309-000174           Q2309-000166

| no. | isDone | Status(en)           | Status(th)  | cart_order_no | data.code (job code, order code) | remark | 
|-----|--------|----------------------|-------------|---------------|----------------------------------|-|
| 1   | Y      | installation confirm | ยืนยันการติดตั้ง | CO2309-000178 | Q2309-000169  | |
| 2   | Y      | contractor no view   | ช่างยังไม่ทราบ | CO2309-000174 | Q2309-000166  | |
| 3   | N      | dc | dc | CO2309-000256 | Q2309-000249  | 1. แก้ราคางวดให้เป็น jobs.quotation.grand_total\n 2. แก้ชื่องวดให้ไปใช้ jobs.quotation.installment_name |
| 4   | N      | dc | dc | ? | Q2309-000248  | 1. แก้ราคาให้เป็น เอาราคาสินค้า + ใบเสนอราคา |
| 5   | N      | dc | dc | ? | CO2309-000248  | 1. ราคาไม่แสดงทั้งๆที่มี orders.total_price\n 2. status ควรจะเป็น exist_quotation แต่เป็น create (มันถูกสร้างเสร็จแล้ว และ สร้างใบเสนอราคาแล้ว ต้องไปเช็คเงื่อนไข exist quotation ที่ 10, 11 อีกรอบว่ามันโอเคยัง) |