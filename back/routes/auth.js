const express = require('express');
const router = express.Router();
const db = require('../db.js');
const sql = require('../sql.js');
const bcrypt = require('bcrypt');  

// admin/goods.vue
// admin/goodsmodify.vue
// admin/goodswrite.vue
// admin/qna.vue
// admin/reservation.vue
// admin/review.vue
// admin/userInfo.vue
router.post("/admin_check", function (request, response) {
    const loginUser = request.body;
  
    db.query(
      sql.admin_check,
      [loginUser.user_no],
      function (error, results, fields) {
        if (results[0].user_tp == 1) {
          // 로그인한 유저의 TP가 1(관리자)인 경우
          return response.status(200).json({
            message: "admin",
          });
        } else {
          return response.status(200).json({
            message: "user",
          });
        }
      }
    );
  });

// views/login.vue
router.post('/kakaoLoginProcess', function (request, response) {
    const kakao = request.body;

    // 데이터 없을 시 회원가입도 진행
    db.query(sql.kakao_check, [kakao.user_id], function (error, results, fields) {
        if (results.length <= 0) {
            db.query(sql.kakaoJoin, [kakao.user_id, kakao.user_nm], function (error, result) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'error' });
                }
                db.query(sql.get_user_no, [kakao.user_id], function (error, results, fields) {
                    if (error) {
                        console.log(error)
                    }
                    return response.status(200).json({
                        message: results[0].user_no
                    })
                })
            })
        }
        // 로그인 
        else {
        db.query(sql.get_user_no, [kakao.user_id], function (error, results, fields) {
            if (error) {
                console.log(error)
            }
            return response.status(200).json({
                message: '로그인',
                user: results[0].user_no
            })
        })
        }
    })
});

// views/login.vue
router.post('/naverlogin', function (request, response) {
    const naverlogin = request.body.naverlogin;
    console.log(naverlogin.email);
    console.log(naverlogin.nickname);

    //0717 23:26추가 네이버 중복 로그인 방지
    db.query(sql.naver_id_check, [naverlogin.email], function (error, results, fields) {
        if (error) {
            console.log(error);
            return response.status(500).json({
                message: 'DB_error'
            });
        }
        if (results.length > 0) {
            // 가입된 계정 존재 
            db.query(sql.get_user_no, [naverlogin.email], function (error, results, fields) {
                if (error) {
                    console.log(error)
                }
                return response.status(200).json({
                    message: results[0].user_no
                })
                
            })
        } else {
            // DB에 계정 정보 입력 
            db.query(sql.naverlogin, [naverlogin.email, naverlogin.nickname], function (error, result) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'error' });
                } 
                db.query(sql.get_user_no, [naverlogin.email], function (error, results, fields) {
                    if (error) {
                        console.log(error)
                    }
                    return response.status(200).json({
                        message: '로그인',
                        user: results[0].user_no
                    })
                })     
            })
        }
    })
})

// views/petupload.vue
router.post('/petupload', function(request, response) {
    const user = request.body;
   
    db.query(sql.petupload, [user.pet_no, user.pet_nm, user.pet_age, user.pet_sex, user.pet_type,user.user_no], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'petupload_error' });
        }
        return response.status(200).json({ message: 'petupload_update' });
    });
});

// views/login.vue
router.post('/login_process', function (request, response) {
    const loginUser = request.body;

    db.query(sql.id_check, [loginUser.user_id], function (error, results, fields) {
        if (results.length <= 0) {
            return response.status(200).json({
                message: 'undefined_id'
            })
        }
        else {
            db.query(sql.login, [loginUser.user_id], function (error, results, fields) {
                const same = bcrypt.compareSync(loginUser.user_pw, results[0].user_pw);

                if (same) {
                    // ID에 저장된 pw 값과 입력한 pw값이 동일한 경우
                    db.query(sql.get_user_no, [loginUser.user_id], function (error, results, fields) {
                        return response.status(200).json({
                            message: results[0].user_no
                        })
                    })
                }
                else {
                     // 비밀번호 불일치
                     return response.status(200).json({
                         message: 'incorrect_pw'
                     })
                }
            })
        }
    })
});

// views/join2.vue
router.post('/join_process', function (request, response) {

    const user = request.body;
    const encryptedPW = bcrypt.hashSync(user.user_pw, 10);

    db.query(sql.id_check, [user.user_id], function (error, results, fields) {
        if (results.length <= 0) {
            db.query(sql.join, [user.user_id, encryptedPW, user.user_nm, user.user_ph, user.pet_no, user.pet_nm, user.pet_age, user.pet_sex, user.pet_type], function (error, data) {
                if (error) {
                    return response.status(500).json({
                        message: 'DB_error'
                    })
                }
                return response.status(200).json({
                    message: 'join_complete'
                });
            })
        }
        else {
            return response.status(200).json({
                message: 'already_exist_id'
            })
        }
    })
});

// views/join2.vue
router.post('/idcheck', function (request, response) {
    const user = request.body;

    db.query(sql.checkDuplicate, [user.user_id], function (error, results) {
        if (error) {
            return response.status(500).json({
                message: 'DB_error'
            })
        }
        if (results.length > 0) {
            response.send('중복');
        } else {
            response.send('확인');
        }
    })
});

// views/find.vue
router.post('/findId', function (request, response, next) {
    const user_ph = request.body.user_ph;

    db.query(sql.id_find, [user_ph], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원 에러' });
        }

        if (results.length === 0) {
            // 휴대전화번호가 데이터베이스에 존재하지 않는 경우
            return response.status(404).json({ message: 'user_not_found' });
        }

        const user_id = results[0].user_id; // 사용자 아이디를 가져옴
        return response.status(200).json({
            message: 'user_ph',
            user_id: user_id
        });
    });
});

// 임시 비밀번호
function generateTempPassword() {
    const length = 3; // 임시 비밀번호의 길이
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const integers = '0123456789';
    const spcharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
    let tempPass= [];
    let tempPassword = '';

    for (let i = 0; i < length; i++) {
        const randomIndex1 = Math.floor(Math.random() * characters.length);
        const randomIndex2 = Math.floor(Math.random() * integers.length);
        const randomIndex3 = Math.floor(Math.random() * spcharacters.length);
        tempPass[i] = characters[randomIndex1] + integers[randomIndex2] + spcharacters[randomIndex3];
        tempPassword += tempPass[i];
    }

    return tempPassword;
}

// views/find.vue
router.post('/findPw', function (request, response, next) {
    const user_id = request.body.user_id;
    const user_ph = request.body.user_ph;

    db.query(sql.user_check, [user_ph, user_id], async function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원 에러' });
        }

        if (results.length == 0) {
            // 휴대전화번호가 데이터베이스에 존재하지 않는 경우
            return response.status(404).json({ message: 'user_not_found' });
        }

        const user_pw = generateTempPassword(); // 임시 비밀번호 생성

        const encryptedPW = bcrypt.hashSync(user_pw, 10); // 임시 비밀번호 암호화

        // 업데이트
        db.query(sql.pass_update_tem, [encryptedPW, user_id], function (error, results, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: '비번 에러' });
            }
            return response.status(200).json({
                message: user_pw
            });
        });

    });
});


//의료진 체크
router.post('/doc_check', function (request, response) {
    const loginUser = request.body;

    db.query(sql.doc_check, [loginUser.user_id], function (error, results, fields) {
        if (results.length <= 0) {
            return response.status(200).json({
                message: 'user'
            })
        }
        else {
            return response.status(200).json({
                message: 'doc'
            })
        }
    })
});

// views/docSelect.vue
// views/qnawrite.vue
router.get('/getDocData', function (request, response, next) {

    db.query(sql.doc_info, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '정보에러' });
        }
        response.json(results);
    });
});

// admin/userInfo.vue
router.get('/getDocData2', function (request, response, next) {

    db.query(sql.all_doc_info, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '정보에러' });
        }
        response.json(results);
    });
});

//펫 번호 리스트 갖고 오기
router.get('/getPetNo', function (request, response, next) {

    db.query(sql.petno_list, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '정보에러' });
        }
        response.json(results);
    });
});

// views/calendar.vue
router.get('/getPetNo/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.get_pet_no, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원에러' });
        }
        response.json(results);
    });
});

// views/calendar.vue
router.get('/getDocId/:doc_nm', function (request, response, next) {
    const doc_nm = request.params.doc_nm;

    db.query(sql.get_doc_id, [doc_nm], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '정보에러' });
        }
        response.json(results);
    });    
        
});



function sortCaseReplace(sortCase) {
    let order = ` ORDER BY user_no DESC`; // 최근 가입 순
    if (sortCase == 1) { // 오래된 가입 순
        order = ` ORDER BY user_no`;
    }
    return order;
}

// admin/userInfo.vue
router.get('/admin/userlist/:sortCase/:keyword', function (request, response, next) {

    const sortCase = request.params.sortCase;
    const keyword = request.params.keyword;
    let search = '';

    if (keyword != 'none') {
        search = ' AND user_id Like "%' + keyword + '%" ';
    }

    const arrange = sortCaseReplace(sortCase);

    db.query(sql.userlist + search + arrange, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원리스트에러' });
        }
        response.json(results);
    });
});

// admin/userInfo.vue
router.delete('/admin/userlist/:user_no', function (request, response, next) {
    const userNo = request.params.user_no;

    db.query(sql.deleteUser, [userNo], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원삭제에러' });
        }
        return response.status(200).json({ message: '회원삭제성공' });
    });
});

// admin/userInfo.vue
router.get('/admin/getPetData/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.admin_pet_info, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '동물정보에러' });
        }
        response.json(results);
    });
});

// views/docHistory.vue
router.get('/dochistory', function (request, response) {

    db.query(sql.get_dochis, function (error, results) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        response.json(results);
    });
});

module.exports = router;