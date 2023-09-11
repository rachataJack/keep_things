for (let i = 0; i < jobs.length; i++) {
    
    const job = jobs[i];
    
    // 1. ถ้าเจอ status = 'paid_to_contractor' ใน history คือ set 1. 'paid_to_contractor'
    if (job.status_history.find(s => s.value === 'paid_to_contractor')) {
      job.status = 'paid_to_contractor'

    // 2. ถ้าเจอ status = 'survey_finished' ให้ set 2. 'request_quotation'
    } else if (job.status == 'survey_finished') {
      job.status = 'request_quotation';

    // 3. ถ้าเจอ jobType == I และ status เป็น installation_req หรือ create ก็ได้
    // ให้ดูเงื่อนไขตามนี้
    // 3.1 ถ้า isQuotation == true ให้ set 3.1 เป็น 'status' เดิมนั่นแหละ
    // 3.2 isQuotation == false ให้ set 3.2 เป็น 'request_quotation'
    } else if (job.type_of_job === 'I' && (job.status == 'installation_requested' || job.status == 'created')) {
      job.status = job.quotation && job.quotation.length
          ? job.status
          : 'request_quotation';
    
    // 4. ถ้าเจอ status 'assigned' หรือ 'installation_confirmed'
    // then ให้ check ต่อว่ามันเป็น contractor หรือป่าว -> ที่ if ด้านในมันคือเช็คดูว่า ช่างมารับรู้แล้วรึป่าว ถ้ารับรู้แล้วก็ให้เป็น assigned, ins_conf ตามเดิมน่ะแหละ
    } else if (job.status == 'assigned' || job.status == 'installation_confirmed') {
      if (!(job.contractor_accept && job.contractor_accept.contractor_id)) {
        job.status = 'contractor_no_view';
      }
    }

    // ถ้าเจอ status == 'request_quotation', 'created', 'quotation_management'
    // ให้เช็ค isQuotation 
    // ถ้าใช่ก็ 5. set 'exists_quotation'
    if (job.status === 'request_quotation' || job.status === 'created' || job.status === 'quotation_management') {
      const isExistsQuotation = _.get(job, ['jobFromCode', 0, 'quotation', 0, 'files'], []).length > 0;
      if (isExistsQuotation) job.status = 'exists_quotation';
    }
  }

  new issue 1 อัพเดทวิธีเช็ค status exist exists_quotation
  (P'Pla create งาน สำรวจ ต่อ ติดตั้ง ที่ควรจะมี status นี้ไว้แล้ว job.code = Q2309-000172)
  เงื่อนไขของ status exists_quotation
    1.  'request_quotation' || job.status === 'created' || job.status === 'quotation_management')
    1. jobtype = 'S' (งานสำรวจ)
    2. เมื่อนำ job.code(ex Q2309-000172) ของงาน S ไปหาใน array แล้วพบว่ามี job.code เดียวกันที่มี jobtype = 'I'
    3. เช็ค job type I ที่มี job_origin ว่ามีใบเสนอราคา quotation > 0 * length(quotation) > 0 (ใบ quotation จะมีเฉพาะในงานติดตั้งเท่านั้น)
      3.1 กรณี job type I มีมากกว่า 1 - เช็ค job type I ที่มี job_origin ว่ามีใบเสนอราคา quotation > 0 * length(quotation) > 0 (ใบ quotation จะมีเฉพาะในงานติดตั้งเท่านั้น)
      3.2 กรณีมี type I job เดียวกันเช็คจอปนั้นได้เลยว่า quotation>0 รึป่าว
  
  new issue 2 *อันนี้เป็นอีกการ์ด
  ถ้ามีงานติดตั้ง 'I' มากกว่า 1 งาน
  ตัวหน้าบ้านจะแสดงแค่ row เดียว แต่เราต้องเอา ราคาทั้งหมด ของใบเสนอราคาทุกใบ มารวมกัน (พอดีมันจะมีเคสแบบ ราคาแพงๆ200kเงี้ย เค้าก็แยกบิลอะ)
  โดยสามารถดูได้จาก array quotation ที่ job type 'I' ที่มี flag job_origin เป็น true
 

- "request_quotation"      "รอทำใบเสนอราคา"
"installation_started"     "เริ่มการติดตั้ง"
"installation_requested"   "นัดติดตั้ง"
"assigned"                 "ได้รับมอบหมาย"

"installation_confirmed"   "ยืนยันการติดตั้ง"

"created"                  "สร้างใหม่"
- "paid_to_contractor"     "จ่ายเงินให้ช่างแล้ว"
"installation_finished"    "สิ้นสุดการติดตั้ง"
"survey_finished"          "สิ้นสุดการสำรวจ"
"paid"                     "ชำระเงิน"
"quotation_management"     "อยู่ระหว่างเสนอราคา"

- "exists_quotation"       "สร้างใบเสนอราคาแล้ว"

"survey_started"           "เริ่มสำรวจ"
"installation_accepted"    "ลูกค้ายอมรับ"
"installation_rejected"    "ลูกค้าปฏิเสธ"
- "contractor_no_view"     "ช่างยังไม่ทราบ"
"deleted"                  "ย้ายงาน/Inactive"
"claim"                    "Claim"
