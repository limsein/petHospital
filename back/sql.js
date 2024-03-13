module.exports = {

//auth
id_check: `SELECT * FROM TB_USER WHERE user_id = ?`,  
doc_check: `SELECT DOC_ID FROM TB_DOCTOR WHERE DOC_ID = ?`,
admin_check: `SELECT user_tp FROM tb_user WHERE user_no = ?`,
get_user_no: `SELECT user_no FROM tb_user WHERE user_id = ?`,  
join: `INSERT INTO TB_USER (USER_ID, USER_PW, USER_NM, USER_PH, PET_NO, PET_NM, PET_AGE, PET_SEX, PET_TYPE) 
       VALUES(?,?,?,?,?,?,?,?,?)`,  
login: `SELECT user_pw FROM TB_USER WHERE user_id = ?`,
id_find: `SELECT user_id FROM tb_user WHERE user_ph = ?`,
user_check: `SELECT user_no FROM tb_user WHERE user_ph = ? AND user_id = ?`,
pass_update_tem: `UPDATE tb_user SET user_pw = ? WHERE user_id = ?`,
checkDuplicate: `SELECT * FROM tb_user WHERE user_id = ?`,
get_dochis: `SELECT DOC_NM, DOC_AGE, DOC_PH, DOC_EML, DOC_MJ, HIS_START_YEAR, HIS_CONTENT
            FROM tb_doctor d, tb_history h 
            WHERE d.doc_bio = h.his_code`,

//카카오 로그인
kakaoJoin: `INSERT INTO tb_user (user_id, user_nm, user_social_tp) VALUES(?,?,1)`,
kakao_check: `SELECT * FROM tb_user WHERE user_id = ?`,
petupload:`UPDATE tb_user SET pet_no = ?, pet_nm = ?, pet_age = ?, pet_sex =?, pet_type= ? WHERE user_no = ?`,

//네이버 로그인
naver_id_check: `SELECT * FROM tb_user WHERE user_id = ?`,
naverlogin: `INSERT INTO tb_user (user_id, user_nm, user_social_tp) VALUES (?, ?, 2)`,

//예약
doc_info: 'SELECT * FROM TB_DOCTOR ',
get_doc_id: 'SELECT DOC_ID FROM TB_DOCTOR WHERE DOC_NM = ?',
reservation_create: `INSERT INTO TB_RESERVATION (RES_TITLE, RES_DATE, RES_TIME, DOC_ID, RES_CONTENT, PET_NO)							
                     VALUES (?,?,?,?,?,?)`,
reservation_list: `SELECT * FROM TB_RESERVATION WHERE DOC_ID in (select DOC_ID from TB_DOCTOR where DOC_NM = ? )`,
res_check: `SELECT * FROM TB_RESERVATION WHERE DOC_ID = ? AND RES_DATE = ? AND RES_TIME = ?`,

goods_list2: `SELECT goods_no, goods_nm, goods_img, goods_price, goods_date FROM tb_goods`,

//qna 페이지
qna: `SELECT a.*, b.USER_NM, c.DOC_NM FROM tb_qna a JOIN tb_user b 
       ON a.user_no=b.user_no JOIN tb_doctor c ON a.doc_id = c.doc_id`,
qna_add_image: `UPDATE tb_qna SET qna_image = ? WHERE qna_no = ?`,
qna_check: `select qna_no from tb_qna where user_no = ? and qna_content = ?`,
qna_add: `INSERT INTO tb_qna (user_no, qna_title, qna_content, is_secret, doc_id) VALUES (?,?,?,?,?)`,
qna_img_check: `SELECT qna_image FROM tb_qna`,
content: `SELECT Q.*, D.DOC_NM
              FROM TB_QNA Q, TB_DOCTOR D
              WHERE Q.DOC_ID = D.DOC_ID AND QNA_NO = ?`,

//진료후기 페이지
review_check: `select * from tb_review where rvw_content= ?`,
review_add: `INSERT INTO tb_review (pet_no, rvw_title, rvw_content, doc_id) VALUES (?,?,?,?)`,
//get_review_no: `SELECT rvw_no FROM tb_review where pet_no = ?`,
review_add_image: `UPDATE tb_review SET rvw_img = ? WHERE rvw_no = ?`,
review_img_check: `SELECT rvw_img FROM tb_review`,

//의료진 페이지
petno_list: `SELECT * from tb_user`,
get_doc_info: `SELECT doc_id, doc_nm, doc_age, doc_ph, doc_eml, doc_bio, doc_mj, doc_sex FROM tb_doctor WHERE doc_id = ?`,
docpage_info: `SELECT * FROM tb_doctor WHERE DOC_ID = ?`,
docmypage_update: `UPDATE tb_doctor 
                    SET DOC_NM = ?, DOC_AGE = ?, DOC_PH = ?, DOC_EML = ?, DOC_BIO = ?, DOC_MJ = ?, DOC_SEX = ?
                    WHERE doc_id = ?`,
reviewdocmypagelist: `SELECT r.*, d.DOC_NM FROM tb_review r, tb_doctor d WHERE r.DOC_ID = d.DOC_ID AND r.DOC_ID = ?`,                    
reviewdocdetail: `SELECT r.*, u.PET_IMG, d.DOC_NM FROM tb_review r INNER JOIN tb_user u ON r.PET_NO = u.PET_NO INNER JOIN tb_doctor d ON r.DOC_ID = d.DOC_ID WHERE r.rvw_no = ?`,
review_check2: `select * from tb_review where rvw_no = ? AND rvw_title = ? AND rvw_content= ?`,
review_update: `UPDATE tb_review SET rvw_title = ?, rvw_content = ? WHERE rvw_no = ? `,
reviewEdit: `UPDATE tb_review  SET rvw_content = ?, rvw_title = ? WHERE doc_id = ?`,
docQna: `SELECT q.*, u.USER_NM, d.DOC_NM FROM tb_qna q LEFT JOIN tb_user u ON q.USER_NO = u.USER_NO INNER JOIN tb_doctor d ON q.DOC_ID = d.DOC_ID WHERE q.DOC_ID = ?`,
qnaWrite: `UPDATE tb_qna SET qna_answer = ?, qna_state = 1 WHERE qna_no = ?`,
qna_update: `UPDATE tb_qna SET qna_answer = ?, qna_state = 1 WHERE qna_no = ?`,
docreservation: `SELECT * FROM tb_reservation r JOIN tb_user u ON r.PET_NO = u.PET_NO JOIN tb_doctor d ON r.DOC_ID = d.DOC_ID WHERE r.DOC_ID = ?`,
reservationdetail: `SELECT r.*, d.DOC_NM FROM tb_reservation r, tb_doctor d  where r.DOC_ID = d.DOC_ID and r.RES_NO = ?`,
//마이페이지
get_user_info: `SELECT user_id, user_nm, user_ph, pet_nm, pet_age, pet_sex, pet_type, pet_wgt, pet_img
               FROM tb_user
               WHERE user_no = ?`,
deleteUser: `DELETE FROM tb_user WHERE user_no = ?`,
user_info: `SELECT user_id, user_nm, user_ph, user_social_tp, pet_nm, pet_age, pet_sex, pet_type, pet_img
               FROM tb_user
               WHERE user_no = ?`,
pet_info: `SELECT pet_nm, pet_age, pet_sex, pet_type, pet_img, pet_wgt
               FROM tb_user
               WHERE user_no = ?`,  
get_password: 'SELECT user_pw FROM tb_user WHERE user_no = ?',
pass_update: 'UPDATE tb_user SET user_pw = ? WHERE user_no = ?',                
//마이페이지 Reservation
get_my_res: `SELECT r.RES_NO, r.RES_DATE, r.RES_TIME, r.RES_TITLE, d.DOC_NM
                FROM tb_doctor d, tb_reservation r, tb_user u
                where d.doc_id = r.doc_id and u.pet_no = r.pet_no and u.user_no = ?`,                
deleteRContent: `DELETE FROM tb_reservation WHERE res_no = ?`,  
//마이페이지 Review
get_my_review: `SELECT r.*, d.DOC_NM, d.DOC_PH
                FROM tb_doctor d, tb_review r, tb_user u
                where d.doc_id = r.doc_id and u.pet_no = r.pet_no and u.user_no = ?`,
deleteVContent: `DELETE FROM tb_review WHERE rvw_no = ?`,                  
//마이페이지 QnA
get_my_qna: `SELECT * FROM tb_qna where user_no = ?`,

get_my_qna_detail: `SELECT Q.*, D.DOC_NM, U.USER_NM
                     FROM TB_QNA Q, TB_DOCTOR D, TB_USER U
                     WHERE Q.DOC_ID = D.DOC_ID AND U.USER_NO = Q.USER_NO AND QNA_NO = ?`,
deleteQContent: `DELETE FROM tb_qna WHERE qna_no = ?`,     
qnamodify: `UPDATE tb_qna SET qna_title = ?, qna_content = ? WHERE qna_no = ?`,    
qnamodify_add_image: `UPDATE tb_qna SET qna_image = ? WHERE qna_no = ?`,                                     

//회원정보수정
user_update: `UPDATE tb_user SET user_id = ?, user_nm = ?, user_ph = ? WHERE user_no = ?`,
get_pet_no: `SELECT pet_no from tb_user WHERE user_no = ?`,
petinfo_update: `UPDATE tb_user SET pet_nm = ?, pet_age = ?, pet_wgt = ?, pet_sex =?, pet_type= ? WHERE user_no = ?`,
pet_add_image: `UPDATE tb_user SET pet_img = ? WHERE user_no = ?`,
pet_img_check: `SELECT pet_img FROM tb_user`,

//관리자(유저)페이지
userlist: `SELECT user_no, user_id, user_nm, user_ph, user_social_tp, pet_no, pet_nm, pet_type, pet_age, pet_sex
                FROM tb_user
                WHERE user_tp = 0`,
admin_pet_info: `SELECT pet_no, pet_nm, pet_type, pet_age, pet_sex, pet_img
                FROM tb_user
                WHERE user_no = ?`,     
all_doc_info: `SELECT a.*, b.* FROM tb_doctor a, tb_history b WHERE a.doc_bio = b.his_code`,
      
//관리자(진료후기)페이지
reviewdoclist: `SELECT r.*, d.DOC_NM FROM tb_review r INNER JOIN tb_doctor d ON r.DOC_ID = d.DOC_ID`, 
deleteReview: `DELETE FROM tb_review WHERE rvw_no = ?`,    
reviewdetail: `SELECT r.*, u.PET_IMG, d.DOC_NM FROM tb_review r INNER JOIN tb_user u ON r.PET_NO = u.PET_NO INNER JOIN tb_doctor d ON r.DOC_ID = d.DOC_ID WHERE r.rvw_no = ?`,
reviewhit: `UPDATE tb_review SET rvw_count = rvw_count + 1 WHERE rvw_no = ?`,

//관리자(qna)페이지
qnalist: `SELECT q.*, u.USER_NM, d.DOC_NM FROM tb_qna q LEFT JOIN tb_user u ON q.USER_NO = u.USER_NO INNER JOIN tb_doctor d ON q.DOC_ID = d.DOC_ID`,
deleteQna: `DELETE FROM tb_qna WHERE qna_no = ?`,

//관리자(예약)페이지
admin_reservationlist: `SELECT r.*, u.USER_NM, d.DOC_NM FROM tb_reservation r INNER JOIN tb_user u ON r.PET_NO = u.PET_NO INNER JOIN tb_doctor d ON r.DOC_ID = d.DOC_ID`,
deleteReservation: `DELETE FROM tb_reservation WHERE res_no = ?`,

//관리자(상품)페이지
goods_add: `INSERT INTO tb_goods (goods_nm, goods_price) VALUES (?,?)`,
add_image: `UPDATE tb_goods SET goods_img = ? WHERE goods_no = ?`,
goods_img_check: `SELECT goods_img FROM tb_goods`,
goods_list: `SELECT * FROM tb_goods`,
goods_modify_look: `SELECT * FROM tb_goods WHERE goods_no = ?`,
delete_goods_2: `DELETE FROM tb_goods WHERE GOODS_NO = ?`,
get_img_nm: `SELECT GOODS_IMG FROM tb_goods WHERE GOODS_NO = ?`,
update_goods: `UPDATE tb_goods SET GOODS_NM = ?, GOODS_PRICE = ? WHERE GOODS_NO = ?`,
}