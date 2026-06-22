pipeline {

    agent any

    stages {

        stage('Fetch Secrets') {
            steps {
                // Busca os segredos do Infisical e gera o .env automaticamente
                // --env: ambiente configurado no Infisical (prod)
                // --path: pasta dos segredos que você criou no Infisical (/cardapio)
                // --token: Service Token gerado no Infisical (veja o guia abaixo)
                sh 'npx -y @infisical/cli export --env="prod" --path="/cardapio" --token="st.d3609103-d5a3-4f97-8e76-85dab175e316.2357fb06fafe466502653cad5b861f2c.5e23a2c4ac1bf657df9280453252dd0e" > .env'
            }
        }

        stage('Verificar Repositório') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    submoduleCfg: [],
                    userRemoteConfigs: [[
                        // ⚠️ TROQUE pela URL do SEU repositório no GitHub
                        url: 'https://github.com/RenanFerreirax/Cardapio-Restaurante-micro.git'
                    ]]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Prisma Generate') {
            steps {
                sh 'npx prisma generate'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Docker Up') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d'
            }
        }

        stage('Verificar') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo 'Deploy do micro-cardapio realizado com sucesso!'
        }
        failure {
            echo 'Erro na pipeline do micro-cardapio!'
        }
    }
}
