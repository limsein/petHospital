var express = require('express');
const router = express.Router();
var db = require('../db.js');
var sql = require('../sql.js');
const fs = require('fs');
const path = require("path");
const multer = require('multer');
const bcrypt = require('bcrypt');


// mypage/mypage.vue
router.get('/mypage/:user_no', function (request, response, next) {
    const user_no = request.s.user_no;

    db.query(sql.get_user_info, [user_no], function (error, results, fields) {
        if(error) {
            console.error(error);
            return response.status(500).json({error:'회원에러'});
        }
        response.json(results);
    });
});

// docpage/docpage.vue
router.get('/docpage/:doc_id', function (request, response, next) {
    const doc_id = request.params.doc_id;

    db.query(sql.get_doc_info, [doc_id], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원에러' });
        }
        response.json(results);
    });
});

// docpage/docupdate.vue
router.get('/getDocData', function (request, response, next) {
    const doc_id = request.query.doc_id;

    db.query(sql.docpage_info, [doc_id], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '정보에러' });
        }
        response.json(results);
    });
});

// docpage/docupdate.vue
router.post('/docpage/update', function (request, response, next) {
    const doc = request.body;

    db.query(sql.docmypage_update, [doc.doc_nm, doc.doc_age, doc.doc_ph, doc.doc_eml, doc.doc_bio, doc.doc_mj, doc.gender, doc.doc_id], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'docmypage_update_error' });
        }
        return response.status(200).json({ message: 'docmypage_update' });
    });
});

// mypage/mypage.vue
router.delete('/mypage/userlist/:user_no', function (request, response, next) {
    const userNo = request.params.user_no;

    db.query(sql.deleteUser, [userNo], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원탈퇴에러' });
        }
        return response.status(200).json({ message: '회원탈퇴성공' });
    });
});

// mypage/petupdate.vue
router.get('/getPetData/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.pet_info, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '정보에러' });
        }
        response.json(results);
    });
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
    },
});

// mypage/petupdate.vue
router.post('/petupdate', upload.single('pet_img'), (req, res) => {
    const { pet_nm, pet_age, pet_wgt, pet_sex, pet_type, user_no } = req.body;
    const pet_img = req.file ? req.file.buffer : null;
    db.query(sql.petinfo_update, [pet_nm, pet_age, pet_wgt, pet_sex, pet_type, user_no], (err, result) => {
        if (err) throw err;
        if(pet_img) {
            const date = new Date().toJSON().slice(0, 10);
            const filename = `${date}_${user_no}.${req.file.originalname.split('.').pop()}`;
            fs.writeFile(`${__dirname}` + `../../uploads/uploadPet/${filename}`, pet_img, (err2) => {
                if (err2) throw err2;
                db.query(sql.pet_add_image, [filename, user_no], (err3) => {
                    if (err3) throw err3;
                    res.send('success');
                    db.query(sql.pet_img_check, (err4, rows) => {
                        if (err4) throw err4;
                        const petImgs = rows.map((row) => row.pet_img);
                        fs.readdir(`${__dirname}` + `../../uploads/uploadPet/`, (err5, files) => {
                            if (err5) throw err5;
                            files.forEach((file) => {
                                if (!petImgs.includes(file)) {
                                    fs.unlink(path.join(`${__dirname}` + `../../uploads/uploadPet/`, file), (err6) => {
                                        if (err6) throw err6;
                                        console.log(`삭제된 파일: ${file}`);
                                    });
                                }
                            });
                        });
                    });
                });
            });
        } else {
            res.send('success');
        }
    }, (error) => {
        console.log(error);
        res.send('error');
    });
});

// mypage/mypageupdate.vue
router.get('/getUserData', function (request, response, next) {
    const user_no = request.query.user_no;

    db.query(sql.user_info, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '정보에러' });
        }
        response.json(results);
    });
});

// mypage/mypageupdate.vue
router.post('/mypageupdate', function (request, response, next) {
    const user = request.body;

    db.query(sql.user_update, [user.user_id, user.user_nm, user.user_ph, user.user_no], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'user_update_error' });
        }
        return response.status(200).json({ message: 'user_update' });
    });
});

// mypage/pass.vue
router.post('/pass_process', function (request, response) {
    const pass = request.body;

    db.query(sql.get_password, [pass.user_no], function (error, results, fields) {
        if (results.length <= 0) {
            if (error) {
                return response.status(500).json({
                    message: 'DB_error'
                });
            }
        } else {
            const same = bcrypt.compareSync(pass.user_pw, results[0].user_pw);

            if (!same) {    // 비밀번호 체크
                return response.status(200).json({
                    message: 'pw_ck'
                });
            }
            const encryptedNewPW = bcrypt.hashSync(pass.user_npw, 10); // 새 비밀번호 암호화

            db.query(sql.pass_update, [encryptedNewPW, pass.user_no], function (error, results, fields) {
                if (error) {
                    return response.status(500).json({
                        message: 'DB_error'
                    });
                }

                return response.status(200).json({
                    message: 'pass_update'
                });
            });
        }
    });
});

// mypage/myReservation.vue
router.get('/getMyReservation/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.get_my_res, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '예약에러' });
        }
        response.json(results);
    });
});

// mypage/myReservation.vue
router.post('/reservation/delete', (req, res) => {
    const res_no = req.body;

    db.query(sql.deleteRContent, [res_no.res_no], function (error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: '예약취소에러' });
        } else {
        res.send(result);
        }
    });
});

// mypage/myReview.vue
router.get('/getMyReview/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.get_my_review, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '리뷰에러' });
        }
        response.json(results);
    });
});

// mypage/myReview.vue
router.post('/review/delete', (req, res) => {
    const rvw_no = req.body.rvw_no;

    db.query(sql.deleteVContent, [rvw_no], function (error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: '예약취소에러' });
        } else {
        res.send(result);
        }
    });
});


// mypage/myQna.vue
router.get('/getMyQna/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.get_my_qna, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'QNA에러' });
        }
        response.json(results);
    });
});

// mypage/myQnaDetail.vue
router.post('/qnamodify', upload.single('qna_img'), (req, res) => {
    const { qna_no, qna_title, qna_content } = req.body;
    const qna_img = req.file ? req.file.buffer : null;
    db.query(sql.qnamodify, [qna_title, qna_content, qna_no], (err, result) => {
        if (err) throw err;
        if (qna_img) {
            const date = new Date().toJSON().slice(0, 10);
            const filename = `${date}_${qna_no}.${req.file.originalname.split('.').pop()}`;
            fs.writeFile(`${__dirname}` + `../../uploads/uploadQna/${filename}`, qna_img, (err2) => {
                if (err2) throw err2;
                db.query(sql.qnamodify_add_image, [filename, qna_no], (err3) => {
                    if (err3) throw err3;
                    res.send('success');
                    console.log(filename)
                    db.query(sql.qna_img_check, (err4, rows) => {
                        if (err4) throw err4;
                        const qnaImgs = rows.map((row) => row.qna_image);
                        fs.readdir(`${__dirname}` + `../../uploads/uploadQna/`, (err5, files) => {
                            if (err5) throw err5;
                            files.forEach((file) => {
                                if (!qnaImgs.includes(file)) {
                                    fs.unlink(path.join(`${__dirname}` + `../../uploads/uploadQna/`, file), (err6) => {
                                        if (err6) throw err6;
                                        console.log(`삭제된 파일: ${file}`);
                                    });
                                }
                            });
                        });
                    });
                });
            });
        } else {
            res.send('success');
        }
    }, (error) => {
        console.log(error);
        res.send('error');
    });
});

// admin/qnadetail.vue
// docpage/docqnadetail.vue
// mypage/myQnaDetail.vue
router.get('/getMyQnaDetail/:qna_no', function (request, response, next) {
    const qna_no = request.params.qna_no;

    db.query(sql.get_my_qna_detail, [qna_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'QNA에러' });
        }
        response.json(results);
    });
});

// mypage/myQna.vue
router.post('/qna/delete', (req, res) => {
    const qna_no = req.body.qna_no;

    db.query(sql.deleteQContent, [qna_no], function (error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: '예약취소에러' });
        } else {
        res.send(result);
        }
    });
});

// docpage/docreview.vue
router.get('/docpage/docreview/:docId', function (request, response, next) {

    const docId = request.params.docId;

    db.query(sql.reviewdocmypagelist, [docId], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '의사리스트에러' });
        }
        response.json(results);
    });
});

// docpage/docreview.vue
router.delete('/docpage/docreview/:rvw_no', function (request, response, next) {
    const reviewNo = request.params.rvw_no;

    db.query(sql.deleteReview, [reviewNo], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '진료기록삭제에러' });
        }
        return response.status(200).json({ message: '진료기록삭제성공' });
    });
});

// docpage/docreviewdetail.vue
router.post('/docpage/docreview/detail', (request, response) => {
    const reviewNo = request.body.rvw_no;

    db.query(sql.reviewdocdetail, [reviewNo], function (error, results) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '내용로드에러' });
        }
        else {
            db.query(sql.reviewhit, [reviewNo])
        }
        response.json(results);
    });
});

// docpage/docqna.vue
router.get('/docpage/docqna/:docId', function (request, response, next) {

    const docId = request.params.docId;

    db.query(sql.docQna, [docId], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '의사리스트에러' });
        }
        response.json(results);
    });
});

// docpage/docqna.vue
router.delete('/docpage/docqna/:qna_no', function (request, response, next) {
    const qnaNo = request.params.qna_no;

    db.query(sql.deleteQna, [qnaNo], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '진료기록삭제에러' });
        }
        return response.status(200).json({ message: '진료기록삭제성공' });
    });
});


// docpage/docreservation.vue
router.get('/docpage/docreservation/:docId', function (request, response, next) {

    const docId = request.params.docId;

    db.query(sql.docreservation, [docId], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '목록에러' });
        }
        response.json(results);
    });
});

// docpage/docreservation.vue
router.delete('/docpage/docreservation/:res_no', function (request, response, next) {
    const reservationNo = request.params.res_no;

    db.query(sql.deleteReservation, [reservationNo], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '목록삭제에러' });
        }
        return response.status(200).json({ message: '목록삭제성공' });
    });
});


module.exports = router;