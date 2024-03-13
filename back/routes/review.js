const express = require('express');
const router = express.Router();
const db = require('../db.js');
const sql = require('../sql.js');
const fs = require('fs');
const multer = require('multer');
const path = require("path");
//const bcrypt = require('bcrypt');

function sortNCaseReplace(sortNCase) {
    let order = ` ORDER BY rvw_date DESC, rvw_no DESC`; // 최근 순
    if (sortNCase == 1) { // 오래된 순
        order = ` ORDER BY rvw_date, rvw_no DESC`;
    }
    if (sortNCase == 2) { // 조회수 높은 순
        order = ` ORDER BY rvw_count DESC, rvw_no DESC`;
    }
    if (sortNCase == 3) { // 조회수 낮은 순
        order = ` ORDER BY rvw_count, rvw_no DESC`;
    }
    return order;
}

function sortACaseReplace(sortACase) {
    let order = ` ORDER BY rvw_date DESC, rvw_no DESC`; // 최근 순
    if (sortACase == 1) { // 오래된 순
        order = ` ORDER BY rvw_date, rvw_no DESC`;
    }
    if (sortACase == 2) { // 조회수 높은 순
        order = ` ORDER BY rvw_count DESC, rvw_no DESC`;
    }
    if (sortACase == 3) { // 조회수 낮은 순
        order = ` ORDER BY rvw_count, rvw_no DESC`;
    }
    return order;
}

// views/review.vue
router.get('/review/:sortNCase/:keyword', function (request, response, next) {

    const sortNCase = request.params.sortNCase;
    const keyword = request.params.keyword;
    
    let search = '';

    if (keyword != 'none') {
        search = ' WHERE DOC_NM Like "%' + keyword + '%" ';
    }

    const narrange = sortNCaseReplace(sortNCase);

    db.query(sql.reviewdoclist + search + narrange, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '의사리스트에러' });
        }
        response.json(results);
    });
});



// mypage/myReviewContent.vue
// views/reviewdetail.vue
router.post('/reviewdetail', (request, response) => {
    const reviewNo = request.body.rvw_no;

    db.query(sql.reviewdetail, [reviewNo], function (error, results) {
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

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
    },
});

// docpage/reviewWrite.vue
router.post('/write', upload.single('rvw_img'), (req, res) => {
    const { pet_no, rvw_title, rvw_content, doc_id } = req.body;
    const rvw_img = req.file.buffer;
    db.query(sql.review_check, [rvw_content], function (error, results, fields) {
        if (results.length <= 0) {
    db.query(sql.review_add, [pet_no, rvw_title, rvw_content, doc_id], (err, result) => { //다른 값을 먼저 저장해서 rvw_no 자동생성
        if (err) throw err;
        const rvw_no = result.insertId;   //자동생성된 rvw_no를 전달받음
        const date = new Date().toJSON().slice(0, 10);  //현재 날짜를 가져오고, 연-월-일 형식으로 변환
        const filename = `${date}_${rvw_no}.${req.file.originalname.split('.').pop()}`;   //파일 이름을 날짜_번호.원래확장자 형식으로 변환
        fs.writeFile(`${__dirname}` + `../../uploads/uploadReview/${filename}`, rvw_img, (err2) => {
            if (err2) throw err2;
            db.query(sql.review_add_image, [filename, rvw_no], (err3) => {
                if (err3) throw err3;
                res.send('success');
                db.query(sql.review_img_check, (err4, rows) => { //상품사진 저장된 폴더 확인해서 rvw_image 필드의 값과 일치하지 않는 파일이 있을 경우 삭제함
                    if (err4) throw err4;
                    const reviewImgs = rows.map((row) => row.rvw_img);
                    fs.readdir(`${__dirname}` + `../../uploads/uploadReview/`, (err5, files) => {
                        if (err5) throw err5;
                        files.forEach((file) => {
                            if (!reviewImgs.includes(file)) {
                                fs.unlink(path.join(`${__dirname}` + `../../uploads/uploadReview/`, file), (err6) => {
                                    if (err6) throw err6;
                                    console.log(`삭제된 파일: ${file}`);
                                });
                            }
                        });
                    });
                });
            });
        });
    }, (error) => {
        console.log(error);
        res.send('error');
    });
}
else {
    return res.status(200).json({
        message: 'already_exist_goods'
    })
  }
    });
});

// docpage/docreviewdetail.vue
router.post('/docreviewedit', upload.single('rvw_image'), (req, res) => {
    const { rvw_no, rvw_title, rvw_content} = req.body;
    const rvw_image = req.file ? req.file.buffer : null;
    db.query(sql.review_check2, [rvw_no, rvw_title, rvw_content], function (error, results, fields) {
        if (results.length <= 0) {
    db.query(sql.review_update, [rvw_title, rvw_content, rvw_no], (err, result) => { //다른 값을 먼저 저장해서 rvw_no 자동생성
        if (err) throw err;
        //const rvw_no = result.insertId;   //자동생성된 rvw_no를 전달받음
        if(rvw_image) { //vue에서 사진 데이터를 보냈을 때만 사진첨부과정 진행
            const date = new Date().toJSON().slice(0, 10);  //현재 날짜를 가져오고, 연-월-일 형식으로 변환
            const filename = `${date}_${rvw_no}.${req.file.originalname.split('.').pop()}`;   //파일 이름을 날짜_번호.원래확장자 형식으로 변환
            fs.writeFile(`${__dirname}` + `../../uploads/uploadReview/${filename}`, rvw_image, (err2) => {
                if (err2) throw err2;
                db.query(sql.review_add_image, [filename, rvw_no], (err3) => {
                    if (err3) throw err3;
                    res.send('success');
                    db.query(sql.review_img_check, (err4, rows) => { //상품사진 저장된 폴더 확인해서 rvw_image 필드의 값과 일치하지 않는 파일이 있을 경우 삭제함
                        if (err4) throw err4;
                        const reviewImgs = rows.map((row) => row.rvw_img);
                        fs.readdir(`${__dirname}` + `../../uploads/uploadReview/`, (err5, files) => {
                            if (err5) throw err5;
                            files.forEach((file) => {
                                if (!reviewImgs.includes(file)) {
                                    fs.unlink(path.join(`${__dirname}` + `../../uploads/uploadReview/`, file), (err6) => {
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
}
else {
    return res.status(200).json({
        message: 'already_exist_goods'
    })
  }
    });
});

// admin/reviewdetail.vue
// router.post('/admin/reviewdetail', (request, response) => {
//     const reviewNo = request.body.rvw_no;

//     db.query(sql.reviewdetail, [reviewNo], function (error, results) {
//         if (error) {
//             console.error(error);
//             return response.status(500).json({ error: '내용로드에러' });
//         }
//         response.json(results);
//     });
// });

// admin/review.vue
router.get('/admin/reviewlist/:sortACase/:keyword', function (request, response, next) {

    const sortACase = request.params.sortACase;
    const keyword = request.params.keyword;
    
    let search = '';

    if (keyword != 'none') {
        search = ' WHERE DOC_NM Like "%' + keyword + '%" ';
    }

    const aarrange = sortACaseReplace(sortACase);

    db.query(sql.reviewdoclist + search + aarrange, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '의사리스트에러' });
        }
        response.json(results);
    });
});

// admin/review.vue
router.delete('/admin/reviewlist/:rvw_no', function (request, response, next) {
    const reviewNo = request.params.rvw_no;

    db.query(sql.deleteReview, [reviewNo], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '진료기록삭제에러' });
        }
        return response.status(200).json({ message: '진료기록삭제성공' });
    });
});

// router.post('/admin/reviewdetail', (request, response) => {
//     const reviewNo = request.body.rvw_no;

//     db.query(sql.reviewdetail, [reviewNo], function (error, results) {
//         if (error) {
//             console.error(error);
//             return response.status(500).json({ error: '내용로드에러' });
//         }
//         response.json(results);
//     });
// });

// router.post('/admin/reviewdetail/reviewedit', (request, response) => {
//     const aReviewEdit = request.body;
//     db.query(sql.reviewEdit, [aReviewEdit.title, aReviewEdit.content, aReviewEdit.number], function (error, result) {
//         if (error) {
//             console.error(error);
//             return response.status(500).json({ error: 'error' });
//         } else {
//             response.send(result);
//         }
//     })
// });

module.exports = router;