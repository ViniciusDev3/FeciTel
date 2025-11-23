document.addEventListener('DOMContentLoaded', function() {

    const API_URL = 'http://localhost:3000';

    // ============================================================
    // 1. CAMADA DE SERVIÇO (CONEXÃO COM O BACKEND)
    // ============================================================
    const ProjectService = {
        
        // BUSCAR PROJETOS (GET)
        async listar() {
            try {
                console.log("Fazendo request para:", `${API_URL}/projetos`);
                const response = await fetch(`${API_URL}/projetos`);
                console.log("Response status:", response.status, response.statusText);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Erro na resposta:", errorText);
                    throw new Error(`Erro ${response.status}: ${errorText}`);
                }
                
                const projetos = await response.json();
                console.log("Projetos carregados:", projetos.length);
                return projetos; 
            } catch (error) {
                console.error("Erro ao buscar projetos:", error);
                return []; 
            }
        },

        // SALVAR PROJETO (POST) COM UPLOAD DE ARQUIVO
        async salvar(formData) {
            try {
                console.log("Enviando dados para o servidor");
                
                const response = await fetch(`${API_URL}/projetos`, {
                    method: 'POST',
                    body: formData
                });

                console.log("Resposta do servidor:", response.status, response.statusText);

                if (response.ok) {
                    const projetoSalvo = await response.json();
                    console.log("Projeto salvo com sucesso:", projetoSalvo);
                    return true;
                } else {
                    const erroTexto = await response.text();
                    console.error('Erro ao salvar:', response.status, erroTexto);
                    return false;
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                return false;
            }
        }
    };

    // ============================================================
    // 2. LÓGICA DA PÁGINA "AGENDA" (Listagem)
    // ============================================================
    const projectsContainer = document.getElementById('projects-container');

    if (projectsContainer) {
        console.log("Iniciando carregamento da agenda");
        
        ProjectService.listar().then(projects => {
            console.log("Projetos para renderizar:", projects);
            
            if (projects.length === 0) {
                console.log("Nenhum projeto encontrado");
                projectsContainer.innerHTML = '<p class="text-center text-muted">Nenhum projeto cadastrado ainda.</p>';
                return;
            }

            console.log("Iniciando renderização de", projects.length, "projetos");

            projects.forEach((proj, index) => {
                console.log(`Renderizando projeto ${index + 1}:`, proj.title);
                
                const col = document.createElement('div');
                col.className = 'col-md-4 col-sm-6 mb-4'; 
                
                // LÓGICA DA IMAGEM ATUALIZADA - USA IMAGEM PADRÃO SE NÃO HOUVER IMAGEM
                let imgSrc = `${API_URL}/uploads/imagem_padrao1.jpeg`;
                
                if (proj.image) {
                    if (proj.image.startsWith('uploads/')) {
                        imgSrc = `${API_URL}/${proj.image}`;
                        console.log(`Imagem uploads: ${imgSrc}`);
                    } else if (proj.image.startsWith('data:image')) {
                        imgSrc = proj.image;
                        console.log(`Imagem base64: ${proj.title}`);
                    } else {
                        imgSrc = proj.image;
                        console.log(`Imagem URL: ${imgSrc}`);
                    }
                } else {
                    console.log(`Usando imagem padrão: ${proj.title}`);
                }

                col.innerHTML = `
                    <div class="card card-agenda h-100" style="cursor: pointer;">
                        <div class="card-header bg-white text-center fw-bold text-primary border-0 pt-3">
                            ${proj.title}
                        </div>
                        <img src="${imgSrc}" class="card-img-top" alt="${proj.title}" style="height: 200px; object-fit: cover;" onerror="this.src='${API_URL}/uploads/imagem_padrao1.jpeg'">
                        <div class="card-footer">
                            <span class="date-badge">${proj.date}h</span>
                            <small class="text-white opacity-75">${proj.students}</small>
                        </div>
                    </div>
                `;

                col.addEventListener('click', function() {
                    const mTitle = document.getElementById('modal-title');
                    const mImg = document.getElementById('modal-img');
                    const mDesc = document.getElementById('modal-desc');
                    const mDate = document.getElementById('modal-date');
                    const mStudents = document.getElementById('modal-students');
                    const mModalEl = document.getElementById('infoModal');

                    if (mTitle) mTitle.textContent = proj.title;
                    if (mImg) {
                        mImg.src = imgSrc;
                        mImg.onerror = function() {
                            this.src = `${API_URL}/uploads/imagem_padrao1.jpeg`;
                        };
                    }
                    if (mDesc) mDesc.textContent = proj.description || "Sem descrição disponível.";
                    if (mDate) mDate.textContent = proj.date;
                    if (mStudents) mStudents.textContent = proj.students;

                    if (mModalEl) {
                        const myModal = new bootstrap.Modal(mModalEl);
                        myModal.show();
                    }
                });
                
                projectsContainer.appendChild(col);
            });
            
            console.log("Renderização concluída");
        }).catch(error => {
            console.error("Erro no carregamento:", error);
        });
    } else {
        console.log("Elemento projects-container não encontrado");
    }

    // ============================================================
    // 3. LÓGICA DA PÁGINA "SUBMISSÃO" (Formulário)
    // ============================================================
    const uploadTrigger = document.getElementById('upload-trigger');
    const fileInput = document.getElementById('project-photo');
    const previewImg = document.getElementById('preview-img');
    const uploadContent = document.getElementById('upload-content');
    const submissionForm = document.querySelector('form');

    if (uploadTrigger && fileInput) {
        uploadTrigger.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas arquivos de imagem!');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert('A imagem é muito grande! Por favor, selecione uma imagem menor que 5MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImg.src = event.target.result;
                    previewImg.style.display = 'block';
                    if (uploadContent) uploadContent.style.display = 'none';
                    uploadTrigger.style.borderStyle = 'solid';
                    uploadTrigger.style.padding = '10px';
                    console.log("Imagem carregada para preview");
                }
                reader.onerror = function() {
                    alert('Erro ao carregar a imagem. Tente novamente.');
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (submissionForm) {
        submissionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log("Iniciando envio do formulário");
            
            const tituloInput = submissionForm.querySelector('input[placeholder="Título do Projeto"]');
            const nomeInput = submissionForm.querySelector('input[placeholder="Nome completo"]');
            const resumoTextarea = submissionForm.querySelector('textarea');
            const dataInput = document.getElementById('project-date');
            const horaInput = document.getElementById('project-time');
            
            if (!tituloInput || !nomeInput || !resumoTextarea || !dataInput || !horaInput) {
                alert("Erro: Campos do formulário não encontrados!");
                return;
            }

            const titulo = tituloInput.value.trim();
            const nome = nomeInput.value.trim();
            const resumo = resumoTextarea.value.trim();
            const dataSelecionada = dataInput.value;
            const horaSelecionada = horaInput.value;
            const arquivo = fileInput.files[0];
            
            if (!titulo) {
                alert("Por favor, informe o título do projeto!");
                tituloInput.focus();
                return;
            }
            
            if (!nome) {
                alert("Por favor, informe seu nome completo!");
                nomeInput.focus();
                return;
            }
            
            if (!resumo) {
                alert("Por favor, informe o resumo do projeto!");
                resumoTextarea.focus();
                return;
            }

            if (!dataSelecionada) {
                alert("Por favor, selecione a data da apresentação!");
                dataInput.focus();
                return;
            }

            if (!horaSelecionada) {
                alert("Por favor, selecione a hora da apresentação!");
                horaInput.focus();
                return;
            }

            // Formata a data e hora
            const dataObj = new Date(dataSelecionada);
            const dia = dataObj.getDate().toString().padStart(2, '0');
            const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
            
            // Formata a hora (remove os segundos se existirem)
            const horaFormatada = horaSelecionada.substring(0, 5);
            
            const dataFormatada = `${dia}/${mes} - ${horaFormatada}`;

            // Cria FormData para enviar o arquivo e os dados
            const formData = new FormData();
            formData.append('title', titulo);
            formData.append('students', nome);
            formData.append('date', dataFormatada);
            formData.append('description', resumo);
            
            // Se não há arquivo, não envia nada (o servidor vai usar imagem padrão)
            if (arquivo) {
                formData.append('image', arquivo);
            }

            console.log("Dados prontos para enviar:", {
                title: titulo,
                students: nome,
                date: dataFormatada,
                description: resumo,
                hasImage: !!arquivo
            });

            const submitBtn = submissionForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Enviando...";
            submitBtn.disabled = true;

            try {
                const sucesso = await ProjectService.salvar(formData);

                if (sucesso) {
                    alert("Projeto cadastrado com sucesso!");
                    submissionForm.reset();
                    if (previewImg) {
                        previewImg.style.display = 'none';
                    }
                    if (uploadContent) {
                        uploadContent.style.display = 'block';
                    }
                    setTimeout(() => {
                        window.location.href = "03_agenda.html";
                    }, 1000);
                } else {
                    alert("Erro ao salvar o projeto. Verifique o console ou tente novamente.");
                }
            } catch (error) {
                console.error("Erro no envio:", error);
                alert("Erro inesperado ao enviar o projeto. Tente novamente.");
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    const clearBtn = document.getElementById('clear-form');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar o formulário?')) {
                submissionForm.reset();
                if (previewImg) {
                    previewImg.style.display = 'none';
                }
                if (uploadContent) {
                    uploadContent.style.display = 'block';
                }
                console.log("Formulário limpo");
            }
        });
    }
});