const express = require('express');
const router = express.Router();
const db = require('../db.js');
const sql = require('../sql.js');
const fs = require('fs');

const multer = require('multer');
const path = require("path");

//관리자 상품 추가
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
    },
});

// admin/goodswrite.vue
router.post('/admin/add_goods', upload.single('goods_img'), (req, res) => {
    const { goods_nm, goods_price } = req.body;
    const goods_img = req.file.buffer;
    db.query(sql.goods_add, [goods_nm, goods_price], (err, result) => { //다른 값을 먼저 저장해서 goods_no 자동생성
        if (err) throw err;
        const goods_no = result.insertId;   //자동생성된 goods_no를 전달받음
        const date = new Date().toJSON().slice(0, 10);  //현재 날짜를 가져오고, 연-월-일 형식으로 변환
        const filename = `${date}_${goods_no}.${req.file.originalname.split('.').pop()}`;   //파일 이름을 날짜_번호.원래확장자 형식으로 변환
        fs.writeFile(`${__dirname}` + `../../uploads/uploadGoods/${filename}`, goods_img, (err2) => {
            if (err2) throw err2;
            db.query(sql.add_image, [filename, goods_no], (err3) => {
                if (err3) throw err3;
                res.send('success');
                db.query(sql.goods_img_check, (err4, rows) => { //상품사진 저장된 폴더 확인해서 goods_img 필드의 값과 일치하지 않는 파일이 있을 경우 삭제함
                    if (err4) throw err4;
                    const goodsImgs = rows.map((row) => row.goods_img);
                    fs.readdir(`${__dirname}` + `../../uploads/uploadGoods/`, (err5, files) => {
                        if (err5) throw err5;
                        files.forEach((file) => {
                            if (!goodsImgs.includes(file)) {
                                fs.unlink(path.join(`${__dirname}` + `../../uploads/uploadGoods/`, file), (err6) => {
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
});

// admin/goods.vue
router.get('/admin/goodslist/:sortACase/:keyword', function (request, response, next) {

    const sortACase = request.params.sortACase;
    const keyword = request.params.keyword;

    let search = '';

    if (keyword != 'none') {
        search = ' WHERE goods_nm Like "%' + keyword + '%" ';
    }

    const order = sortACaseReplace(sortACase);

    db.query(sql.goods_list + search + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '상품리스트에러' });
        }
        response.json(results);
    });
});

// admin/goodsmodify.vue
router.post('/admin/goodsmodify', (request, response) => {
    const goodsNo = request.body.goods_no;

    db.query(sql.goods_modify_look, [goodsNo], function (error, results) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '내용로드에러' });
        }
        response.json(results);
    });
});

// admin/goodsmodify.vue
router.post('/admin/update_goods', function (request, response, next) {
    const goods = request.body;

    db.query(sql.update_goods, [goods.GOODS_NM, goods.GOODS_PRICE, goods.GOODS_NO], function(error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({ error: 'modify_failed' })
        }
        else {
            return response.status(200).json({ message: 'modify_complete' })
        }
    })
})

// admin/goods.vue
router.post('/admin/delete_goods', function (request, response, next) {
    const goods_no = request.body.GOODS_NO;

    // 이미지 이름 불러오기
    db.query(sql.get_img_nm, [goods_no], function (error, results, fields) {
        if (error) {
            return response.status(500).json({ error: 'goods_error' })
        }
        else {
            try {
                const goods_img = results[0].GOODS_IMG;

                // 이미지 제거
                if (goods_img && !goods_img.includes('imgempty')) {
                    fs.unlinkSync(`${__dirname}../../uploads/uploadGoods/${goods_img}`);
                }

                // 상품 제거
                db.query(sql.delete_goods_2, [goods_no], function (error, results, fields) {
                    if (error) {
                        return response.status(500).json({ error: 'goods_error' })
                    }
                    else {
                        return response.status(200).json({
                            message: 'delete_complete'
                        })
                    }
                })
            }
            catch (error) {
                console.log("에러");
            }
        }
    })
})

// views/goodslist.vue
router.get('/goodslist/:sortACase/:keyword', function (request, response, next) {
    const sortACase = request.params.sortACase;
    const keyword = request.params.keyword;

    let search = '';

    if (keyword != 'none') {
        search = ' WHERE goods_nm Like "%' + keyword + '%" ';
    }

    const order = sortACaseReplace(sortACase);

    db.query(sql.goods_list2 + search + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '상품리스트에러' });
        }
        response.json(results);
    });
});
//admin 상품목록 정렬 
function sortACaseReplace(sortACase) {
    let order = ` ORDER BY goods_no DESC`; // 최근 등록 순
    if (sortACase == 1) { // 오래된 등록 순
        order = ` ORDER BY goods_no`;
    }
    if (sortACase == 2) { // 가격 높은 순
        order = ` ORDER BY goods_price DESC, goods_no DESC`;
    }
    if (sortACase == 3) { // 가격 낮은 순
        order = ` ORDER BY goods_price, goods_no DESC`;
    }
    return order;
}

module.exports = router;