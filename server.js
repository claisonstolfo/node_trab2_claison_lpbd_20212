var express = require('express'); // requisita a biblioteca para a criacao dos serviços web.
 var pg = require("pg"); // requisita a biblioteca pg para a comunicacao com o banco de dados.

 var sw = express(); // iniciliaza uma variavel chamada app que possitilitará a criação dos serviços e rotas.

 sw.use(express.json());//padrao de mensagens em json.

 sw.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    next();
});

const config = {
    host: 'localhost',
    user: 'postgres',
    database: 'db_cs_lpbd_2021_2',
    password: '81171430',
    port: 5432
};

//definia conexao com o banco de dados.
const postgres = new pg.Pool(config);

//definicao do primeiro serviço web.
sw.get('/', (req, res) => {
    res.send('Hello, world! meu primeiro teste.  #####');
})

sw.post('/inserttipomunicao', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q ={
                text: 'insert into tb_tipomunicao (nome, datacriacao) values ($1, now()) returning codigo, nome, to_char(datacriacao, \'dd/mm/yyyy\') as datacriacao',
                values: [req.body.nome]
            }
            console.log(q);
    
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log('retornou 400 no insert');
                    console.log(err);
                    console.log(err.data);
                    res.status(400).send('{'+err+'}');
                }else{

                    console.log('retornou 201 no insert');
                    res.status(201).send(result.rows[0]);//se não realizar o send nao finaliza o client
                }           
            });
       }       
    });
});

sw.post('/updatetipomunicao/', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){

            console.log("Não conseguiu acessar o BD: "+ err);
            res.status(400).send('{'+err+'}');

        }else{

            var q ={
                //update tb_modo set nome = '', quantboots = 0, quantrounds = 0 where codigo = 1;
                text: 'update tb_tipomunicao set nome = $1 where codigo = $2',
                values: [req.body.nome, req.body.codigo]
            }
            console.log(q);
     
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log("Erro no update tipo de municao: "+err);
                    res.status(400).send('{'+err+'}');
                }else{             
                    res.status(200).send(req.body);//se não realizar o send nao finaliza o client nao finaliza
                }
            });
        }
     });
});

sw.get('/deletetipomunicao/:codigo', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados"+ err);
            res.status(400).send('{'+err+'}');
        }else{
            
            var q ={
                text: 'delete FROM tb_tipomunicao where codigo = $1',
                values: [req.params.codigo]
            }
    
            client.query( q , function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send({'codigo': req.params.codigo});//retorna o codigo deletado.
                }

            });
        } 
     });
});


sw.post('/insertmunicao', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q1 ={
                text: 'insert into tb_artefato (tipo, nome, valor, datacriacao) values (\'M\', $1, $2, now()) ' +
                                            'returning codigo, tipo, nome as nomeartefato, valor, to_char(datacriacao, \'dd/mm/yyyy\') as datacriacao;',
                values: [req.body.nomeartefato,
                         req.body.valor]

            }

            console.log(q1);

            client.query(q1, function(err,result1) {
                if(err){
                    console.log('retornou 400 no insert no q1');
                    console.log(err);
                    res.status(400).send('{'+err+'}');                    
                }else{
                    var q2 = {
                        text : 'insert into tb_municao (codartefato, cod_tipomunicao, quant_max_compra, calibre) values ($1, $2, $3, $4) ' +
                                                    'returning codartefato, cod_tipomunicao, quant_max_compra, calibre;',
                        values: [result1.rows[0].codigo,
                                req.body.tipomunicao.codigo,                        
                                req.body.quant_max_compra, 
                                req.body.calibre]
                    }

                    client.query(q2, function(err,result2) {
                        if(err){
                            console.log('retornou 400 no insert no q2');
                            res.status(400).send('{'+err+'}');
                        }else{
                            done(); // closing the connection;
                            console.log('retornou 201 no insert');
                            res.status(201).send({"codartefato" : result1.rows[0].codigo, 
                                                  //"cod_tipomunicao": result2.rows[0].cod_tipomunicao, 
                                                  "quant_max_compra": result2.rows[0].quant_max_compra, 
                                                  "calibre": result2.rows[0].calibre,
                                                  "nomeartefato": result1.rows[0].nomeartefato,
                                                  "valor": result1.rows[0].valor,
                                                  "tipomunicao": {"codigo": result2.rows[0].cod_tipomunicao, 
                                                                  "nome": req.body.tipomunicao.nome ,
                                                                  "datacriacao": req.body.tipomunicao.datacriacao}});


                        }

                    });
                }           
            });
       }       
    });
});


sw.post('/updatemunicao', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            

            var q1 ={
                text: 'update tb_artefato set tipo = \'M\', nome = $1, valor = $2 where codigo = $3 ' +
                                            'returning codigo, tipo, nome as nomeartefato, valor, datacriacao;',
                values: [req.body.nomeartefato,
                         req.body.valor,
                         req.body.codartefato]
            }
            console.log(q1);

            client.query(q1, function(err,result1) {
                if(err){
                    console.log('retornou 400 no update');
                    console.log(err)
                    res.status(400).send('{'+err+'}');
                }else{
                    var q2 = {
                        text: 'update tb_municao set cod_tipomunicao = $1, quant_max_compra = $2, calibre = $3 where codartefato = $4 ' +
                                                     'returning codartefato, cod_tipomunicao, quant_max_compra, calibre;',
                        values: [//result1.rows[0].codigo,
                                req.body.tipomunicao.codigo,                        
                                req.body.quant_max_compra, 
                                req.body.calibre,
                                result1.rows[0].codigo]
                    }
                    client.query(q2, function(err,result2) {
                        if(err){
                            console.log('retornou 400 no update');
                            res.status(400).send('{'+err+'}');
                        }else{
                            done(); // closing the connection;
                            console.log('retornou 201 no update');
                            res.status(201).send({"codartefato" : result1.rows[0].codigo, 
                                                //"cod_tipomunicao": result2.rows[0].cod_tipomunicao, 
                                                 "quant_max_compra": result2.rows[0].quant_max_compra, 
                                                 "calibre": result2.rows[0].calibre,
                                                 "nomeartefato": result1.rows[0].nomeartefato,
                                                 "valor": result1.rows[0].valor,
                                                 "tipomunicao": {"codigo": result2.rows[0].cod_tipomunicao, "nome": req.body.tipomunicao.nome, "datacriacao": result1.rows[0].datacriacao}});
                        }
                    });
                }           
            });
       }       
    });
});


sw.get('/deletemunicao/:codartefato', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados!"+ err);
            res.status(400).send('{'+err+'}');
        }else{          
            var q1 ={
                text: 'delete FROM tb_municao where codartefato = $1',
                values: [req.params.codartefato]
            }
            var q2 ={
                text: 'delete FROM tb_tipomunicao where codigo = $1',
                values: [req.params.codartefato]
            }
            client.query( q1 , function(err,result) {
                
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    client.query( q2 , function(err,result) {
                        done();// closing the connection;
                        if(err){
                            console.log(err);
                            res.status(400).send('{'+err+'}');
                        }else{
                            res.status(200).send({'codartefato': req.params.codartefato});//retorna o codigo deletado.
                        }                    
                    })
                }
            });
        } 
     });
});


sw.get('/listtipomunicao', function (req, res) {

    //estabelece uma conexao com o bd.
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select t.codigo, t.nome, to_char(t.datacriacao, \'dd/mm/yyyy\') as datacriacao from tb_tipomunicao t order by codigo asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});


sw.get('/listmunicao', function (req, res) {

    //estabelece uma conexão com o banco de dados
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        //client.query('select m.codartefato, m.cod_tipomunicao, m.quant_max_compra, m.calibre, t.nome, to_char(t.datacriacao, \'dd/mm/yyyy\') as datacriacao from tb_municao m left join tb_tipomunicao t on (m.cod_tipomunicao=t.codigo) order by codartefato asc;',function(err,result) {
        client.query('select m.codartefato, m.cod_tipomunicao, m.quant_max_compra, m.calibre, t.nome, to_char(t.datacriacao, \'dd/mm/yyyy\') as datacriacao, a.codigo, a.tipo, a.nome as nomeartefato, a.valor, to_char(a.datacriacao, \'dd/mm/yyyy\') as dt_criacao_artefato from tb_municao m left join tb_tipomunicao t on (m.cod_tipomunicao=t.codigo) left join tb_artefato a on (m.codartefato=a.codigo) order by codartefato asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    console.log(result.rows);
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});


sw.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});