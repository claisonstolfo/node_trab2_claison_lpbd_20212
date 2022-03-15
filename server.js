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

            var q ={//insert into tb_tipomunicao (nome, datacriacao) values ('claison', now());
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

sw.get('/listtipomunicao', function (req, res) {

    //estabelece uma conexao com o bd.
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select j.codigo, j.nome, to_char(j.datacriacao, \'dd/mm/yyyy\') as datacriacao from tb_tipomunicao j order by codigo asc;',function(err,result) {        
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


sw.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});