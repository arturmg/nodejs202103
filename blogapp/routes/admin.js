const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')

router.get('/', (req, res)=>{res.render('admin/index')})

//Rota para listagem de 'Categorias'
router.get('/categorias', (req, res)=>{
    Categoria.find().sort({date: 'desc'}).lean().then((categorias)=>{
    res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar as categorias')
        res.redirect('/admin')
    })
})
//Rota para adicionar 'Categorias'
router.get('/categorias/add', (req, res)=>{res.render('admin/addcategorias')})
//Rota para validar a 'Categoria' nova e inserir
router.post('/categorias/nova', (req, res)=>{
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome Inválido'})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug Inválido'})
    }
    if(req.body.nome.length < 2){
        erros.push({texto: 'Nome da categoria muito pequeno'})
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash('success-msg', "Categoria criada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash('error_msg', 'Erro ao criar categoria. Tente novamente.')
            res.redirect('/admin')
        })
    }
})
//Rota para editar a 'Categoria 
router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Categoria inexistente')
        res.redirect('/admin/categorias')
    })
})
//Rota para salvar a 'Categoria' editada
router.post('/categorias/edit', (req, res) =>{
    Categoria.findOne({_id: req.body.id}).then((categoria) =>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.save().then(() => {
            req.flash('success-msg', 'Categoria editada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Erro salvando a categoria')
            res.redirect('/admin/categorias')
        })
    }).catch((err) =>{
        req.flash('error_msg', 'Erro editando a categoria')
        res.redirect('/admin/categorias')
    })
})
//Rota para deletar uma 'Categoria'
router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() =>{
        req.flash('success-msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar categoria')
        res.redirect('/admin/categorias')
    })
})
//Rota para listar as 'postagens'
router.get('/postagens', (req, res) =>{
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar as postagens.')
        res.redirect('/admin')

    })
    
})
//Rota para adicionar uma 'postagem' expondo menu de 'categorias'
router.get('/postagens/add', (req, res) =>{
    Categoria.find().lean().sort({slug: 'asc'}).then((categorias) =>{
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err) =>{
        req.flash('error_msg', 'Erro carregando formulário')
        res.redirect('/admin')
    })
    
})
//Rota para cadastrar uma nova 'postagem' validando se foi definida uma 'categoria'
router.post('/postagens/nova', (req, res)=>{
    var erros = []
    if (req.body.categoria == '0'){
        erros.push({texto: "Categoria inválida! Escolha uma categoria válida."})
    }
    if (erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success-msg', 'Postagem criada com sucesso BLABLA')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro salvando a postagem')
            res.redirect('/admin/postagens')
        })
    }
})
//Rota para editar uma 'postagem'
router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((err) =>{
            req.flash('error_msg', 'Erro listando categorias.')
        })
    }).catch((err) =>{
        req.flash('error_msg', 'Erro carregando postagem.')
    })
})
//Rota para salvar a 'Postagem' editada
router.post('/postagens/edit', (req, res) =>{
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
        postagem.titulo = req.body.titulo,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria,
        postagem.slug = req.body.slug
        postagem.save().then(() => {
            req.flash('success-msg', 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro salvando a postagem')
            res.redirect('/admin/postagens')
        })
    }).catch((err) =>{
        req.flash('error_msg', 'Erro editando a postagem')
        res.redirect('/admin/postagens')
    })
})
//Rota para deletar uma 'postagem'
router.post('/postagens/deletar', (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() =>{
        req.flash('success-msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar postagem')
        res.redirect('/admin/postagens')
    })
})



module.exports = router