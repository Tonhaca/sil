# 🚀 Guia de Deploy - SIL no Railway

## Pré-requisitos

1. **Conta no Railway**: [railway.app](https://railway.app)
2. **Conta no GitHub**: Para conectar o repositório
3. **Repositório Git**: Com o código do SIL

## 📋 Passos para Deploy

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Sistema Inteligente de Licitações - Versão para deploy"
git push origin main
```

### 2. Conectar ao Railway

1. **Acesse o Railway**: [railway.app](https://railway.app)
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha o repositório** do SIL
6. **Clique em "Deploy Now"**

### 3. Configuração Automática

O Railway detectará automaticamente:
- ✅ **Node.js** como runtime
- ✅ **package.json** com scripts
- ✅ **railway.json** com configurações
- ✅ **nixpacks.toml** com build steps

### 4. Variáveis de Ambiente (Opcional)

Se necessário, configure no Railway:
- `NODE_ENV=production`
- `PORT=3000` (configurado automaticamente)

### 5. Deploy Automático

O Railway irá:
1. **Instalar dependências**: `npm ci`
2. **Build do projeto**: `npm run build`
3. **Iniciar servidor**: `npm start`
4. **Gerar URL**: Ex: `https://sil-railway.up.railway.app`

## 🔧 Configurações do Projeto

### Arquivos de Configuração

- **`railway.json`**: Configurações específicas do Railway
- **`nixpacks.toml`**: Build steps e runtime
- **`package.json`**: Scripts e dependências
- **`server.js`**: Servidor Express para produção

### Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento local
npm run build    # Build para produção
npm start        # Servidor de produção
npm run preview  # Preview do build
```

## 🌐 Acesso à Aplicação

Após o deploy, você receberá:
- **URL Principal**: `https://seu-projeto.railway.app`
- **URL Customizada**: Pode ser configurada no Railway
- **HTTPS**: Automático e gratuito

## 📊 Monitoramento

O Railway oferece:
- **Logs em tempo real**
- **Métricas de performance**
- **Status de saúde**
- **Deploy automático** a cada push

## 🔄 Atualizações

Para atualizar a aplicação:
1. **Faça alterações** no código
2. **Commit e push** para o GitHub
3. **Deploy automático** no Railway
4. **URL permanece a mesma**

## 🐛 Troubleshooting

### Problemas Comuns

1. **Build falha**
   - Verifique os logs no Railway
   - Teste localmente: `npm run build`

2. **Aplicação não carrega**
   - Verifique se o servidor está rodando
   - Consulte os logs de erro

3. **API não responde**
   - Verifique conectividade com PNCP
   - Teste endpoints localmente

### Logs Úteis

```bash
# Ver logs no Railway
railway logs

# Ver status do projeto
railway status

# Acessar terminal
railway shell
```

## 📱 Teste da Aplicação

Após o deploy, teste:

1. **Página inicial** carrega corretamente
2. **Busca** funciona (ex: "mamadeira")
3. **Filtros** aplicam corretamente
4. **Detalhes** das licitações abrem
5. **Paginação** funciona
6. **Responsividade** em mobile

## 🔒 Segurança

- **HTTPS automático**
- **Headers de segurança** configurados
- **CORS** configurado para API do PNCP
- **Rate limiting** automático do Railway

## 💰 Custos

- **Railway**: Plano gratuito disponível
- **Limites**: 500 horas/mês no plano free
- **Upgrade**: Conforme necessidade

## 📞 Suporte

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **GitHub Issues**: Para problemas do código
- **Railway Discord**: Comunidade ativa

---

**🎉 Deploy concluído! Sua aplicação está online e pronta para uso.**
