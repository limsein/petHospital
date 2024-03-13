var express = require('express');
const router = express.Router();
var db = require('../db.js');
var sql = require('../sql.js');
const fs = require('fs');
const multer = require('multer');
const path = require("path");


// 답변 작성
router.post('/write_answer', (req, res) => {
  const writeQna = req.body;
  db.query(sql.qnaWrite, [writeQna.qna_answer, writeQna.qna_no], function (error, result) {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'error' });
    } else {
      res.send(result);

    }
  })

});

// qna 상세 내용 불러오기
router.post('/qnacontent', (req, res) => {
  const qnano = req.body.QNA_NO;

  db.query(sql.content, [qnano], function (error, result1) {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'error' });
    } else {
      res.send(result1);


    }
  });
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
      fileSize: 3 * 1024 * 1024,
  },
});

// views/qnawrite.vue
router.post('/write', upload.single('qna_image'), (req, res) => {
  const { user_no, qna_title, qna_content, is_secret, doc_id } = req.body;
  const qna_image = req.file ? req.file.buffer : null;
  db.query(sql.qna_check, [user_no, qna_content], function (error, results, fields) {
    if (results.length <= 0) {
  db.query(sql.qna_add, [user_no, qna_title, qna_content, is_secret, doc_id], (err, result) => { //다른 값을 먼저 저장해서 qna_no 자동생성
      if (err) throw err;
      if(qna_image) {
        const qna_no = result.insertId;   //자동생성된 qna_no를 전달받음
        const date = new Date().toJSON().slice(0, 10);  //현재 날짜를 가져오고, 연-월-일 형식으로 변환
        const filename = `${date}_${qna_no}.${req.file.originalname.split('.').pop()}`;   //파일 이름을 날짜_번호.원래확장자 형식으로 변환
        fs.writeFile(`${__dirname}` + `../../uploads/uploadQna/${filename}`, qna_image, (err2) => {
            if (err2) throw err2;
            db.query(sql.qna_add_image, [filename, qna_no], (err3) => {
                if (err3) throw err3;
                res.send('success');
                db.query(sql.qna_img_check, (err4, rows) => { //상품사진 저장된 폴더 확인해서 qna_image 필드의 값과 일치하지 않는 파일이 있을 경우 삭제함
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
}
else {
  return res.status(200).json({
      message: 'already_exist_goods'
  })
}
  });
});

function sortQCaseReplace(sortQCase) {
  let order = ` ORDER BY qna_date DESC, qna_no DESC`; // 최근 순
  if (sortQCase == 1) { // 오래된 순
      order = ` ORDER BY qna_date, qna_no DESC`;
  }
  return order;
}


// views/qnamain.vue
router.get('/qna_list/:sortQCase/:keyword', function (request, response, next) {
  
    const sortQCase = request.params.sortQCase;
    const keyword = request.params.keyword;
    
    let search = '';

    if (keyword != 'none') {
        search = ' WHERE DOC_NM Like "%' + keyword + '%" ';
    }

    const narrange = sortQCaseReplace(sortQCase);
  
    db.query(sql.qna + search + narrange, function (err, results, fields) {
      if (err) {
        console.error(err);
        return response.status(500).json({ error: '의사리스트에러' });
      }
      response.json(results);
    }); 
});



// views/qnaDetail.vue
router.get('/qnadetail/:qna_no', (req, res) => {
  const qnano = req.params.qna_no;

  db.query(sql.content, [qnano], function (error, result1) {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'error' });
    } else {
      res.json(result1);


    }
  });
}) 

router.post('/docqnaUpdate', function (request, response) {
  const qna = request.body;

  db.query(sql.qna_update, [qna.qna_answer, qna.qna_no], function (error, results, fields) {
    if (error) {
      return response.status(500).json({
        message: 'DB_error'
      })
    }  
      return response.status(200).json({
        message: 'success'
      });
    
  })
});

  async function getQnaList(sortCaseNum, setSearchNum, keyword) {
    let search = '';

    if (keyword != 'none') {
        if (setSearchNum == 0) {
            search = ` WHERE USER_NM Like "%${keyword}%"`;
        } else if (setSearchNum == 1) {
            search = ` WHERE DOC_NM Like "%${keyword}%"`;
        }
    }

    const arrange = sortCaseReplace(sortCaseNum);

    return new Promise((resolve, reject) => {
        db.query(sql.qnalist + search + arrange, function (error, results, fields) {
            if (error) {
                console.error(error);
                reject(error);
            }
            resolve(results);
        });
    });
  }

function sortCaseReplace(sortCase) {
    let order = ` ORDER BY qna_date DESC, qna_no DESC`; // 최근 순
    if (sortCase == 1) { // 오래된 순
        order = ` ORDER BY qna_date, qna_no DESC`;
    }
    return order;
}

// admin/qna.vue
router.get('/admin/qnalist/:setSearchNum/:sortCase/:keyword', async function (request, response, next) {

    const sortCase = request.params.sortCase;
    const setSearchNum = request.params.setSearchNum;
    const keyword = request.params.keyword;

    const arrange = sortCaseReplace(sortCase);

    try {
        const results = await getQnaList(sortCase, setSearchNum, keyword);
        response.json(results);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: '목록에러' });
    }
});

// admin/qna.vue
router.delete('/admin/qnalist/:qna_no', function (request, response, next) {
  const qnaNo = request.params.qna_no;

  db.query(sql.deleteQna, [qnaNo], function (error, result, fields) {
      if (error) {
          console.error(error);
          return response.status(500).json({ error: '문의내역삭제에러' });
      }
      return response.status(200).json({ message: '문의내역삭제성공' });
  });
});

// docpage/qnaAnswer.vue
router.post('/write_answer', (req, res) => {
  const writeQna = req.body;
  db.query(sql.qnaWrite, [writeQna.qna_answer, writeQna.qna_no], function (error, result) {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'error' });
    } else {
      res.send(result);

    }
  })

});


module.exports = router;