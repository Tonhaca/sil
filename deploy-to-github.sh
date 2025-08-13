#!/bin/bash

echo "🚀 Script para subir o projeto no GitHub"
echo "=========================================="
echo ""

echo "📋 Passos para criar o repositório:"
echo "1. Acesse: https://github.com/new"
echo "2. Repository name: sistema-inteligente-licitacoes"
echo "3. Description: Sistema Inteligente de Licitações - Aplicação web moderna para buscar licitações públicas do PNCP"
echo "4. Visibility: Public (ou Private)"
echo "5. NÃO inicialize com README (já temos)"
echo "6. Clique em 'Create repository'"
echo ""

echo "🔗 Após criar o repositório, execute estes comandos:"
echo ""

# Comandos para conectar ao GitHub
echo "# Adicionar o remote do GitHub"
echo "git remote add origin https://github.com/SEU_USUARIO/sistema-inteligente-licitacoes.git"
echo ""

echo "# Fazer push para o GitHub"
echo "git branch -M main"
echo "git push -u origin main"
echo ""

echo "✅ Pronto! Seu projeto estará no GitHub!"
echo ""
echo "🔗 URL do repositório: https://github.com/SEU_USUARIO/sistema-inteligente-licitacoes"
echo "📱 Para deploy no Railway: https://railway.app/new"
echo ""

echo "🎯 Próximos passos:"
echo "1. Conectar ao Railway para deploy automático"
echo "2. Configurar domínio personalizado (opcional)"
echo "3. Configurar CI/CD (opcional)"
echo ""
