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

//define a conexao com o banco de dados.
const postgres = new pg.Pool(config);


//definicao do primeiro serviço web.
sw.get('/', (req, res) => {
    res.send('Hello, world! meu primeiro teste.  #####');
})


sw.get('/listmunicao', function (req, res) {

    //estabelece uma conexão com o banco de dados
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select m.codartefato, m.cod_tipomunicao, m.quant_max_compra, m.calibre, t.codigo, t.nome, to char(t.datacriacao, \'dd/mm/yyyy\') from tb_municao m left join tb_tipomunicao t on (m.cod_tipomunicao=t.codigo) order by codartefato asc;',function(err,result) {        
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