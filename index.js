<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Examen Interactivo</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <style>
        :root {
            --primary: #5e35b1;
            --primary-dark: #4527a0;
            --primary-light: #d1c4e9;
            --secondary: #3949ab;
            --success: #43a047;
            --success-light: #e8f5e9;
            --danger: #e53935;
            --danger-light: #ffebee;
            --warning: #fb8c00;
            --warning-light: #fff3e0;
            --info: #039be5;
            --info-light: #e1f5fe;
            --light: #f5f5f5;
            --light-gray: #eceff1;
            --gray: #78909c;
            --dark: #263238;
            --white: #ffffff;
            --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            --shadow-hover: 0 4px 8px rgba(0, 0, 0, 0.15);
            --transition: all 0.2s ease;
            --border-radius: 6px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', sans-serif;
            background-color: var(--light-gray);
            color: var(--dark);
            line-height: 1.6;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            display: flex;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }

        .main-container {
            max-width: 700px;
            margin: 0 auto;
            width: 100%;
        }

        .fade-enter-active,
        .fade-leave-active {
            transition: opacity 0.3s ease;
        }

        .fade-enter-from,
        .fade-leave-to {
            opacity: 0;
        }

        .card {
            background-color: var(--white);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            padding: 25px;
            margin-bottom: 20px;
            width: 100%;
        }

        .card-header {
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            padding-bottom: 15px;
            margin-bottom: 20px;
            text-align: center;
        }

        .card-title {
            font-size: 1.4rem;
            font-weight: 600;
            color: var(--primary);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            border-radius: var(--border-radius);
            font-weight: 500;
            text-align: center;
            cursor: pointer;
            transition: var(--transition);
            border: none;
            outline: none;
            font-size: 0.95rem;
        }

        .btn-sm {
            padding: 8px 15px;
            font-size: 0.85rem;
        }

        .btn-primary {
            background-color: var(--primary);
            color: var(--white);
        }

        .btn-primary:hover {
            background-color: var(--primary-dark);
            box-shadow: var(--shadow-hover);
        }

        .btn-secondary {
            background-color: var(--secondary);
            color: var(--white);
        }

        .btn-success {
            background-color: var(--success);
            color: var(--white);
        }

        .btn-danger {
            background-color: var(--danger);
            color: var(--white);
        }

        .btn-warning {
            background-color: var(--warning);
            color: var(--white);
        }

        .btn-info {
            background-color: var(--info);
            color: var(--white);
        }

        .btn-outline {
            background-color: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
        }

        .btn-outline:hover {
            background-color: var(--primary);
            color: var(--white);
        }

        .btn-disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .form-control {
            width: 100%;
            max-width: 400px;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: var(--border-radius);
            font-size: 1rem;
            transition: var(--transition);
            background-color: var(--white);
            margin: 0 auto;
        }

        .form-control:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(94, 53, 177, 0.2);
            outline: none;
        }

        .alert {
            padding: 12px 15px;
            border-radius: var(--border-radius);
            margin-bottom: 20px;
            border-left: 4px solid transparent;
            font-size: 0.95rem;
        }

        .alert-success {
            background-color: var(--success-light);
            border-color: var(--success);
            color: #2e7d32;
        }

        .alert-danger {
            background-color: var(--danger-light);
            border-color: var(--danger);
            color: #c62828;
        }

        .alert-warning {
            background-color: var(--warning-light);
            border-color: var(--warning);
            color: #e65100;
        }

        .alert-info {
            background-color: var(--info-light);
            border-color: var(--info);
            color: #0277bd;
        }

        .progress {
            height: 6px;
            background-color: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
        }

        .progress-bar {
            height: 100%;
            background-color: var(--primary);
            transition: width 0.6s ease;
        }

        .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: var(--transition);
        }

        .modal.show {
            opacity: 1;
            visibility: visible;
        }

        .modal-content {
            background-color: var(--white);
            border-radius: var(--border-radius);
            width: 90%;
            max-width: 500px;
            padding: 25px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            padding-bottom: 15px;
            margin-bottom: 15px;
        }

        .modal-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--primary);
        }

        .modal-body {
            margin-bottom: 20px;
            color: var(--gray);
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .question-container {
            background-color: var(--light);
            padding: 20px;
            border-radius: var(--border-radius);
            margin-bottom: 20px;
        }

        .question-text {
            font-size: 1.15rem;
            font-weight: 500;
            margin-bottom: 15px;
            color: var(--dark);
        }

        .answers-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .answer-option {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            border-radius: var(--border-radius);
            background-color: var(--white);
            border: 1px solid #ddd;
            cursor: pointer;
            transition: var(--transition);
        }

        .answer-option.selected {
            border-color: var(--primary);
            background-color: var(--primary-light);
        }

        .answer-option.correct {
            border-color: var(--success);
            background-color: var(--success-light);
        }

        .answer-option.incorrect {
            border-color: var(--danger);
            background-color: var(--danger-light);
        }

        .answer-option.partially-correct {
            border-color: var(--warning);
            background-color: var(--warning-light);
        }

        .answer-letter {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-weight: 600;
            background-color: var(--light);
            color: var(--dark);
            flex-shrink: 0;
            font-size: 0.9rem;
        }

        .answer-option.selected .answer-letter {
            background-color: var(--primary);
            color: var(--white);
        }

        .answer-option.correct .answer-letter {
            background-color: var(--success);
            color: var(--white);
        }

        .answer-option.incorrect .answer-letter {
            background-color: var(--danger);
            color: var(--white);
        }

        .answer-option.partially-correct .answer-letter {
            background-color: var(--warning);
            color: var(--white);
        }

        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }

        .result-card {
            background-color: var(--white);
            border-radius: var(--border-radius);
            padding: 20px;
            text-align: center;
            box-shadow: var(--shadow);
        }

        .result-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .result-label {
            color: var(--gray);
            font-size: 0.9rem;
        }

        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--success);
            color: var(--white);
            padding: 12px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-hover);
            display: flex;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transform: translateY(100%);
            transition: var(--transition);
        }

        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }

        .notification-icon {
            margin-right: 10px;
        }

        .text-center {
            text-align: center;
        }

        .text-primary {
            color: var(--primary);
        }

        .text-success {
            color: var(--success);
        }

        .text-danger {
            color: var(--danger);
        }

        .text-warning {
            color: var(--warning);
        }

        .text-info {
            color: var(--info);
        }

        .text-gray {
            color: var(--gray);
        }

        .font-bold {
            font-weight: 600;
        }

        .mt-2 {
            margin-top: 8px;
        }

        .mt-4 {
            margin-top: 16px;
        }

        .mb-2 {
            margin-bottom: 8px;
        }

        .mb-3 {
            margin-bottom: 12px;
        }

        .mb-4 {
            margin-bottom: 16px;
        }

        .ml-2 {
            margin-left: 8px;
        }

        .ml-4 {
            margin-left: 16px;
        }

        .mr-2 {
            margin-right: 8px;
        }

        .flex {
            display: flex;
        }

        .flex-col {
            flex-direction: column;
        }

        .items-center {
            align-items: center;
        }

        .justify-between {
            justify-content: space-between;
        }

        .justify-center {
            justify-content: center;
        }

        .gap-4 {
            gap: 16px;
        }

        .space-y-2 > * + * {
            margin-top: 8px;
        }

        .space-y-4 > * + * {
            margin-top: 16px;
        }

        .space-x-2 > * + * {
            margin-left: 8px;
        }

        .grid {
            display: grid;
        }

        .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .block {
            display: block;
        }

        .rounded-lg {
            border-radius: var(--border-radius);
        }

        .bg-gray-100 {
            background-color: #f7f7f7;
        }

        .p-3 {
            padding: 12px;
        }

        .p-5 {
            padding: 20px;
        }

        .text-sm {
            font-size: 0.85rem;
        }

        .text-lg {
            font-size: 1.125rem;
        }

        .text-xl {
            font-size: 1.25rem;
        }

        .text-2xl {
            font-size: 1.5rem;
        }

        .map-container {
            width: 100%;
            height: 300px;
            margin: 20px 0;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            position: relative;
        }

        .map-placeholder {
            width: 100%;
            height: 100%;
            background-color: var(--light);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gray);
        }

        @media (max-width: 768px) {
            .card {
                padding: 20px;
            }
            
            .results-grid {
                grid-template-columns: 1fr;
            }
            
            .modal-content {
                width: 95%;
                padding: 20px;
            }
            
            .grid-cols-2 {
                grid-template-columns: 1fr;
            }
        }

        /* Estilos para impresión */
        @media print {
            body * {
                visibility: hidden;
            }
            #app .card, #app .card * {
                visibility: visible;
            }
            #app .card {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                box-shadow: none;
                padding: 10px;
                margin: 0;
            }
            .results-grid {
                display: flex !important;
                flex-direction: row !important;
                gap: 10px;
                margin-bottom: 15px;
            }
            .result-card {
                padding: 10px;
                flex: 1;
            }
            .result-value {
                font-size: 1.5rem;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="main-container">
        <div id="app">
            <!-- Modal de ubicación -->
            <div class="modal" :class="{show: showLocationModal}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Ubicación Requerida</h3>
                    </div>
                    <div class="modal-body">
                        <p>Para continuar con el examen, necesitamos acceder a tu ubicación. Esto nos ayuda a garantizar la integridad del proceso.</p>
                        <div v-if="locationError" class="alert alert-danger mt-3">
                            {{ locationError }}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button @click="cancelExam" class="btn btn-outline">Cancelar</button>
                        <button @click="requestLocation" class="btn btn-primary">Compartir Ubicación</button>
                    </div>
                </div>
            </div>

            <!-- Pantalla de configuración -->
            <transition name="fade">
                <div v-if="showConfig && isAdmin" class="card">
                    <div class="card-header">
                        <h2 class="card-title">Configuración del Examen</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="block mb-2 font-medium">Hora de inicio:</label>
                            <input v-model="examConfig.startTime" type="time" class="form-control">
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Hora de fin:</label>
                            <input v-model="examConfig.endTime" type="time" class="form-control">
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Duración (minutos):</label>
                            <input v-model="examConfig.duration" type="number" min="1" class="form-control">
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Número de preguntas:</label>
                            <input v-model="examConfig.numQuestions" type="number" min="5" max="50" class="form-control">
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Proteger preguntas:</label>
                            <select v-model="examConfig.protectQuestions" class="form-control">
                                <option :value="true">Sí</option>
                                <option :value="false">No</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Ubicación obligatoria:</label>
                            <select v-model="examConfig.requireLocation" class="form-control">
                                <option :value="true">Sí</option>
                                <option :value="false">No</option>
                            </select>
                        </div>
                    </div>
                    <div class="text-center">
                        <button @click="saveConfig" class="btn btn-success">Guardar Configuración</button>
                    </div>
                </div>
            </transition>

            <!-- Pantalla de ingreso de código -->
            <transition name="fade">
                <div v-if="currentScreen === 'code'" class="card">
                    <div class="card-header">
                        <h2 class="card-title">Ingrese su código de acceso</h2>
                    </div>
                    
                    <div v-if="!isExamTime" class="alert alert-warning">
                        <p v-if="timeUntilStart > 0">El examen comenzará en: <strong class="text-primary">{{ formatCountdown(timeUntilStart) }}</strong></p>
                        <p v-else-if="timeUntilEnd <= 0">El examen ha finalizado. Próximo examen: {{ examConfig.startTime }}</p>
                        <p v-else>Horario permitido: {{ examConfig.startTime }} - {{ examConfig.endTime }}</p>
                    </div>
                    
                    <div v-if="hasCompletedExam && isExamTime" class="alert alert-info">
                        <p class="font-bold">¡Ya completaste el examen!</p>
                        <p>Tu calificación: <strong>{{ lastExamScore }}%</strong></p>
                        <button @click="downloadPreviousExam" class="btn btn-sm btn-info mt-2">
                            Descargar resultados
                        </button>
                    </div>
                    
                    <div class="flex flex-col items-center">
                        <input 
                            v-model="enteredCode" 
                            @keyup.enter="verifyCode"
                            :disabled="isCodeBlocked || !isExamTime || (hasCompletedExam && isExamTime)"
                            type="text" 
                            class="form-control mb-4 text-center"
                            placeholder="Ingrese su código">
                        
                        <div v-if="isCodeBlocked" class="text-center mb-4">
                            <p class="text-danger mb-2">Código incorrecto. Espere:</p>
                            <div class="text-2xl font-bold text-danger">{{ countdown }} segundos</div>
                        </div>
                        
                        <button 
                            @click="verifyCode"
                            :disabled="isCodeBlocked || !isExamTime || (hasCompletedExam && isExamTime)"
                            class="btn btn-primary">
                            Continuar
                        </button>
                        
                        <button 
                            v-if="developmentMode"
                            @click="toggleAdmin"
                            class="btn btn-outline mt-4">
                            {{ isAdmin ? 'Desactivar Admin' : 'Activar Admin' }}
                        </button>
                    </div>
                </div>
            </transition>

            <!-- Pantalla de información del usuario -->
            <transition name="fade">
                <div v-if="currentScreen === 'user-info'" class="card">
                    <div class="card-header">
                        <h2 class="card-title">Verifique su información</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="block mb-2 font-medium">Cédula:</label>
                            <div class="p-3 bg-gray-100 rounded-lg">{{ currentUser.ci }}</div>
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Nombre:</label>
                            <div class="p-3 bg-gray-100 rounded-lg">{{ currentUser.nombre }}</div>
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Correo:</label>
                            <div class="p-3 bg-gray-100 rounded-lg">{{ currentUser.correo }}</div>
                        </div>
                        <div>
                            <label class="block mb-2 font-medium">Código:</label>
                            <div class="p-3 bg-gray-100 rounded-lg">{{ currentUser.codigo }}</div>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="mb-4">Por favor verifique que esta información es correcta antes de comenzar.</p>
                        <p class="text-sm text-gray-500 mb-4">Duración del examen: {{ examConfig.duration }} minutos</p>
                        <button 
                            @click="verifyAndStartExam" 
                            class="btn btn-success">
                            Confirmar y comenzar
                        </button>
                    </div>
                </div>
            </transition>

            <!-- Pantalla de examen -->
            <transition name="fade">
                <div v-if="currentScreen === 'exam'" class="card">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                        <div class="mb-4 md:mb-0">
                            <h2 class="text-xl font-bold text-primary">Examen Interactivo</h2>
                            <p class="text-sm text-gray-500">Tiempo restante: <span class="font-bold">{{ formatTime(timeLeft) }}</span></p>
                        </div>
                        <div class="flex space-x-2">
                            <span class="badge badge-primary">
                                Pregunta {{ currentQuestionIndex + 1 }} de {{ selectedQuestions.length }}
                            </span>
                            <span class="badge badge-secondary">
                                Intento #{{ attemptNumber }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="question-container">
                        <div v-if="examConfig.protectQuestions">
                            <img :src="currentQuestionImage" class="w-full h-auto mb-4 rounded-lg" alt="Pregunta">
                        </div>
                        <h3 v-else class="question-text">{{ currentQuestion.text }}</h3>
                    </div>
                    
                    <div class="answers-container">
                        <div 
                            v-for="(answer, index) in currentQuestion.answers" 
                            :key="index"
                            @click="toggleAnswer(index)"
                            class="answer-option"
                            :class="{
                                'selected': selectedAnswers.includes(index) && !showFeedback,
                                'correct': showFeedback && answer.correct,
                                'incorrect': showFeedback && selectedAnswers.includes(index) && !answer.correct,
                                'partially-correct': showFeedback && answer.correct && selectedAnswers.includes(index) && !allCorrectAnswersSelected
                            }">
                            <div class="answer-letter">
                                {{ String.fromCharCode(65 + index) }}
                            </div>
                            <div>{{ answer.text }}</div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col md:flex-row md:justify-center md:items-center mt-6 gap-4">
                        <div v-if="showFeedback" class="text-center">
                            <p v-if="answerIsFullyCorrect" class="text-success font-bold">¡Respuesta correcta!</p>
                            <p v-else-if="answerIsPartiallyCorrect" class="text-warning font-bold">Parcialmente correcta</p>
                            <p v-else class="text-danger font-bold">Incorrecto. Respuestas correctas: {{ correctAnswersText }}</p>
                        </div>
                        
                        <button 
                            v-if="!showFeedback && selectedAnswers.length > 0"
                            @click="checkAnswer"
                            class="btn btn-primary">
                            Verificar
                        </button>
                        <button 
                            v-if="showFeedback"
                            @click="nextQuestion"
                            class="btn btn-primary">
                            {{ isLastQuestion ? 'Finalizar examen' : 'Siguiente' }}
                        </button>
                    </div>
                    
                    <div class="mt-6">
                        <div class="flex justify-between mb-2 text-sm">
                            <span>Progreso: {{ Math.round((currentQuestionIndex / selectedQuestions.length) * 100) }}%</span>
                            <span>Tiempo: {{ formatTime(elapsedTime) }}</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar" :style="{ width: `${(currentQuestionIndex / selectedQuestions.length) * 100}%` }"></div>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- Pantalla de resultados -->
            <transition name="fade">
                <div v-if="currentScreen === 'results'" class="card">
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-bold text-primary mb-2">Resultados del Examen</h2>
                        <p class="text-lg">Gracias por completar el examen, {{ currentUser.nombre }}!</p>
                        <p class="text-sm text-gray-500">Intento #{{ attemptNumber }} - {{ new Date().toLocaleString() }}</p>
                    </div>
                    
                    <div class="results-grid">
                        <div class="result-card">
                            <div class="result-value text-primary">{{ score }}%</div>
                            <div class="result-label">Puntuación</div>
                        </div>
                        <div class="result-card">
                            <div class="result-value text-success">{{ correctAnswersCount }}</div>
                            <div class="result-label">Respuestas correctas</div>
                        </div>
                        <div class="result-card">
                            <div class="result-value text-secondary">{{ formatTime(elapsedTime) }}</div>
                            <div class="result-label">Tiempo empleado</div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-5 rounded-lg mb-6">
                        <h3 class="text-lg font-semibold mb-4">Información del Examen</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="font-medium">Inicio:</p>
                                <p>{{ formatDateTime(examStartTime) }}</p>
                            </div>
                            <div>
                                <p class="font-medium">Finalización:</p>
                                <p>{{ formatDateTime(examFinishTime) }}</p>
                            </div>
                            <div v-if="examLocation">
                                <p class="font-medium">Ubicación:</p>
                                <p>Lat: {{ examLocation.latitude.toFixed(6) }}, Long: {{ examLocation.longitude.toFixed(6) }}</p>
                            </div>
                            <div v-if="locationError">
                                <p class="font-medium text-danger">Error:</p>
                                <p>{{ locationError }}</p>
                            </div>
                        </div>
                        
                        <!-- Mapa de ubicación con Leaflet -->
                        <div v-if="examLocation" class="mt-4">
                            <h4 class="font-medium mb-2">Ubicación aproximada:</h4>
                            <div class="map-container">
                                <div id="leaflet-map" style="width: 100%; height: 100%;"></div>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">Esta ubicación se incluirá en el certificado</p>
                        </div>
                        <div v-else-if="locationError" class="map-container">
                            <div class="map-placeholder">
                                <p>No se pudo obtener la ubicación</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center no-print">
                        <button 
                            @click="downloadResults"
                            class="btn btn-danger">
                            Descargar PDF
                        </button>
                        <button 
                            @click="window.print()"
                            class="btn btn-primary ml-4">
                            Imprimir Resultados
                        </button>
                    </div>
                </div>
            </transition>

            <!-- Notificación -->
            <div class="notification" :class="{show: showDownloadNotification}">
                <svg class="notification-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>PDF descargado correctamente</span>
            </div>
        </div>
    </div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>

    <script>
        const { createApp, ref, computed, onMounted, onUnmounted, nextTick } = Vue;
        
        createApp({
            setup() {
                // Modo desarrollo
                const developmentMode = window.location.href.startsWith('file://') || 
                                      window.location.hostname === 'localhost' || 
                                      window.location.hostname === '127.0.0.1';
                
                // Configuración del examen
                const examConfig = ref({
                    startTime: '11:26',
                    endTime: '18:00',
                    duration: 30,
                    numQuestions: 3,
                    protectQuestions: true,
                    requireLocation: true
                });
                
                // Datos de usuarios
                const users = ref([
                    { ci: '12345678', nombre: 'Juan Pérez', correo: 'juan@example.com', codigo: 'ABC123' },
                    { ci: '87654321', nombre: 'María García', correo: 'maria@example.com', codigo: 'DEF456' },
                    { ci: '45678912', nombre: 'Carlos López', correo: 'carlos@example.com', codigo: 'GHI789' },
                    { ci: '00000000', nombre: 'Administrador', correo: 'admin@example.com', codigo: 'ADMIN' }
                ]);
                
                // Banco de preguntas
                const questionBank = ref([
                    {
                        text: "¿Cuáles de estas son capitales de países 1?",
                        answers: [
                            { text: "París", correct: true },
                            { text: "Madrid", correct: true },
                            { text: "Berlín", correct: true },
                            { text: "Milán", correct: false }
                        ]
                    },
                    {
                        text: "¿Cuáles de estas son capitales de países 2?",
                        answers: [
                            { text: "París", correct: true },
                            { text: "Madrid", correct: true },
                            { text: "Berlín", correct: true },
                            { text: "Milán", correct: false }
                        ]
                    },
                    {
                        text: "¿Cuáles de estas son capitales de países 3?",
                        answers: [
                            { text: "París", correct: true },
                            { text: "Madrid", correct: true },
                            { text: "Berlín", correct: true },
                            { text: "Milán", correct: false }
                        ]
                    },
                    {
                        text: "Seleccione los lenguajes de programación:",
                        answers: [
                            { text: "JavaScript", correct: true },
                            { text: "HTML", correct: false },
                            { text: "Python", correct: true },
                            { text: "CSS", correct: false }
                        ]
                    },
                    {
                        text: "¿Cuáles de estos son planetas del sistema solar 4?",
                        answers: [
                            { text: "Marte", correct: true },
                            { text: "Venus", correct: true },
                            { text: "Luna", correct: false },
                            { text: "Titán", correct: false }
                        ]
                    }
                ]);
                
                // Variables de estado
                const currentScreen = ref('code');
                const enteredCode = ref('');
                const isCodeBlocked = ref(false);
                const countdown = ref(5);
                const currentUser = ref(null);
                const selectedQuestions = ref([]);
                const currentQuestionIndex = ref(0);
                const selectedAnswers = ref([]);
                const showFeedback = ref(false);
                const answerIsFullyCorrect = ref(false);
                const answerIsPartiallyCorrect = ref(false);
                const userAnswers = ref([]);
                const examStartedAt = ref(null);
                const elapsedTime = ref(0);
                const timerInterval = ref(null);
                const examEndTime = ref(null);
                const timeLeft = ref(0);
                const timeUpdateInterval = ref(null);
                const timeUntilStart = ref(0);
                const timeUntilEnd = ref(0);
                const hasCompletedExam = ref(false);
                const lastExamScore = ref(0);
                const showDownloadNotification = ref(false);
                const examResults = ref(null);
                const currentQuestionImage = ref(null);
                const questionImages = ref({});
                const showLocationModal = ref(false);
                const examLocation = ref(null);
                const examStartTime = ref(null);
                const examFinishTime = ref(null);
                const locationError = ref(null);
                const attemptNumber = ref(1);
                const isAdmin = ref(false);
                const showConfig = ref(false);
                const leafletMap = ref(null);
                const leafletMarker = ref(null);

                // Computed properties
                const currentQuestion = computed(() => selectedQuestions.value[currentQuestionIndex.value]);
                const isLastQuestion = computed(() => currentQuestionIndex.value === selectedQuestions.value.length - 1);
                const allCorrectAnswersSelected = computed(() => {
                    if (!currentQuestion.value) return false;
                    const correctIndices = currentQuestion.value.answers
                        .map((answer, index) => answer.correct ? index : -1)
                        .filter(index => index !== -1);
                    return correctIndices.every(index => selectedAnswers.value.includes(index)) && 
                           selectedAnswers.value.every(index => currentQuestion.value.answers[index].correct);
                });
                const correctAnswersText = computed(() => {
                    if (!currentQuestion.value) return '';
                    return currentQuestion.value.answers
                        .map((answer, index) => answer.correct ? String.fromCharCode(65 + index) : '')
                        .filter(x => x)
                        .join(', ');
                });
                const correctAnswersCount = computed(() => {
                    return userAnswers.value.reduce((acc, answerIndices, qIdx) => {
                        const question = selectedQuestions.value[qIdx];
                        const correctIndices = question.answers
                            .map((answer, idx) => answer.correct ? idx : -1)
                            .filter(idx => idx !== -1);
                        
                        // Respuesta completamente correcta
                        if (arraysEqual(new Set(answerIndices), new Set(correctIndices))) {
                            return acc + 1;
                        }
                        
                        // Respuesta parcialmente correcta (mitad de punto)
                        const correctSelected = answerIndices.filter(idx => question.answers[idx].correct).length;
                        const totalCorrect = correctIndices.length;
                        const incorrectSelected = answerIndices.filter(idx => !question.answers[idx].correct).length;
                        
                        if (correctSelected > 0 && incorrectSelected === 0) {
                            return acc + (correctSelected / totalCorrect);
                        }
                        
                        return acc;
                    }, 0);
                });
                const score = computed(() => {
                    const total = selectedQuestions.value.length;
                    if (total === 0) return 0;
                    return Math.round((correctAnswersCount.value / total) * 100);
                });
                const isExamTime = computed(() => {
                    if (developmentMode && isAdmin.value) return true;
                    
                    const now = new Date();
                    const [startHours, startMins] = examConfig.value.startTime.split(':').map(Number);
                    const [endHours, endMins] = examConfig.value.endTime.split(':').map(Number);
                    
                    const startTime = new Date();
                    startTime.setHours(startHours, startMins, 0, 0);
                    
                    const endTime = new Date();
                    endTime.setHours(endHours, endMins, 0, 0);
                    
                    if (timeUntilStart.value <= 0 && timeUntilEnd.value > 0) {
                        return true;
                    }
                    
                    return now >= startTime && now <= endTime;
                });

                // Métodos
                const arraysEqual = (set1, set2) => {
                    if (set1.size !== set2.size) return false;
                    for (const item of set1) {
                        if (!set2.has(item)) return false;
                    }
                    return true;
                };
                
                const isQuestionFullyCorrect = (qIndex) => {
                    const question = selectedQuestions.value[qIndex];
                    const userAnswer = userAnswers.value[qIndex];
                    const correctIndices = question.answers
                        .map((answer, idx) => answer.correct ? idx : -1)
                        .filter(idx => idx !== -1);
                    
                    return arraysEqual(new Set(userAnswer), new Set(correctIndices));
                };
                
                const verifyCode = () => {
                    if (isCodeBlocked.value) return;
                    
                    const user = users.value.find(u => u.codigo === enteredCode.value);
                    if (user) {
                        currentUser.value = user;
                        
                        if (user.codigo === 'ADMIN') {
                            isAdmin.value = true;
                            showConfig.value = true;
                            return;
                        }
                        
                        const examCompletedCookie = Cookies.get(`completed_${user.codigo}`);
                        const examResultsCookie = Cookies.get(`results_${user.codigo}`);
                        
                        if (examCompletedCookie === 'true' && examResultsCookie) {
                            hasCompletedExam.value = true;
                            examResults.value = JSON.parse(examResultsCookie);
                            lastExamScore.value = examResults.value.score;
                            return;
                        }
                        
                        const attemptCookie = Cookies.get(`attempt_${user.codigo}`);
                        attemptNumber.value = attemptCookie ? parseInt(attemptCookie) + 1 : 1;
                        
                        currentScreen.value = 'user-info';
                        enteredCode.value = '';
                    } else {
                        blockCodeInput();
                    }
                };
                
                const blockCodeInput = () => {
                    isCodeBlocked.value = true;
                    countdown.value = 5;
                    
                    const interval = setInterval(() => {
                        countdown.value--;
                        
                        if (countdown.value <= 0) {
                            clearInterval(interval);
                            isCodeBlocked.value = false;
                            enteredCode.value = '';
                        }
                    }, 1000);
                };
                
                const getLocation = () => {
                    return new Promise((resolve, reject) => {
                        if (!navigator.geolocation) {
                            locationError.value = "Geolocalización no soportada en tu navegador";
                            reject(locationError.value);
                            return;
                        }

                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                examLocation.value = {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                    accuracy: position.coords.accuracy
                                };
                                locationError.value = null;
                                showLocationModal.value = false;
                                resolve(examLocation.value);
                            },
                            (error) => {
                                let errorMessage;
                                switch(error.code) {
                                    case error.PERMISSION_DENIED:
                                        errorMessage = "Permiso denegado. Debes compartir tu ubicación para continuar.";
                                        break;
                                    case error.POSITION_UNAVAILABLE:
                                        errorMessage = "Información de ubicación no disponible.";
                                        break;
                                    case error.TIMEOUT:
                                        errorMessage = "Tiempo de espera agotado para obtener la ubicación.";
                                        break;
                                    default:
                                        errorMessage = "Error desconocido al obtener la ubicación.";
                                }
                                locationError.value = errorMessage;
                                reject(errorMessage);
                            },
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                        );
                    });
                };
                
                const requestLocation = async () => {
                    try {
                        await getLocation();
                        await startExamAfterLocation();
                    } catch (error) {
                        console.error("Error al obtener ubicación:", error);
                    }
                };
                
                const cancelExam = () => {
                    showLocationModal.value = false;
                    currentScreen.value = 'code';
                    locationError.value = "Examen cancelado: ubicación requerida no proporcionada";
                };
                
                const verifyAndStartExam = async () => {
                    if (examConfig.value.requireLocation) {
                        showLocationModal.value = true;
                    } else {
                        await startExamAfterLocation();
                    }
                };
                
                const startExamAfterLocation = async () => {
                    examStartTime.value = new Date();
                    
                    const numQuestions = Math.min(examConfig.value.numQuestions, questionBank.value.length);
                    selectedQuestions.value = shuffleArray([...questionBank.value]).slice(0, numQuestions);
                    
                    selectedQuestions.value.forEach(q => {
                        q.answers = shuffleArray(q.answers);
                    });
                    
                    currentScreen.value = 'exam';
                    examStartedAt.value = new Date();
                    
                    const endTime = new Date(examStartedAt.value);
                    endTime.setMinutes(endTime.getMinutes() + examConfig.value.duration);
                    examEndTime.value = endTime;
                    
                    startTimer();
                    userAnswers.value = [];
                    selectedAnswers.value = [];
                    
                    if (examConfig.value.protectQuestions) {
                        await updateCurrentQuestionImage();
                    }
                    
                    Cookies.set(`attempt_${currentUser.value.codigo}`, attemptNumber.value, { expires: 1 });
                };
                
                const textToImage = async (text, questionId) => {
                    if (questionImages.value[questionId]) {
                        return questionImages.value[questionId];
                    }
                    
                    const tempElement = document.createElement('div');
                    tempElement.style.position = 'absolute';
                    tempElement.style.left = '-9999px';
                    tempElement.style.width = '600px';
                    tempElement.style.padding = '1rem';
                    tempElement.style.backgroundColor = '#ffffff';
                    tempElement.style.border = '1px solid #e5e7eb';
                    tempElement.style.borderRadius = '0.5rem';
                    tempElement.style.fontSize = '1.125rem';
                    tempElement.style.fontWeight = '500';
                    tempElement.style.color = '#111827';
                    tempElement.textContent = text;
                    
                    document.body.appendChild(tempElement);
                    
                    try {
                        const canvas = await html2canvas(tempElement, {
                            width: tempElement.offsetWidth,
                            height: tempElement.offsetHeight,
                            scale: 1,
                            logging: false,
                            useCORS: true
                        });
                        
                        const imageData = canvas.toDataURL('image/png');
                        questionImages.value[questionId] = imageData;
                        return imageData;
                    } catch (error) {
                        console.error('Error al convertir texto a imagen:', error);
                        return null;
                    } finally {
                        document.body.removeChild(tempElement);
                    }
                };
                
                const updateCurrentQuestionImage = async () => {
                    if (!examConfig.value.protectQuestions) return;
                    
                    const question = currentQuestion.value;
                    if (!question) return;
                    
                    const questionId = question.text;
                    const imageData = await textToImage(question.text, questionId);
                    currentQuestionImage.value = imageData;
                };
                
                const toggleAnswer = (index) => {
                    if (showFeedback.value) return;
                    
                    if (selectedAnswers.value.includes(index)) {
                        selectedAnswers.value = selectedAnswers.value.filter(i => i !== index);
                    } else {
                        selectedAnswers.value = [...selectedAnswers.value, index];
                    }
                };
                
                const checkAnswer = () => {
                    if (selectedAnswers.value.length === 0) return;
                    
                    showFeedback.value = true;
                    
                    const correctIndices = currentQuestion.value.answers
                        .map((answer, index) => answer.correct ? index : -1)
                        .filter(index => index !== -1);
                    
                    // Verificar si todas las respuestas seleccionadas son correctas y se seleccionaron todas las correctas
                    const allSelectedCorrect = selectedAnswers.value.every(index => 
                        currentQuestion.value.answers[index].correct);
                    const allCorrectSelected = correctIndices.every(index => 
                        selectedAnswers.value.includes(index));
                    
                    answerIsFullyCorrect.value = allSelectedCorrect && allCorrectSelected;
                    answerIsPartiallyCorrect.value = allSelectedCorrect && !allCorrectSelected;
                    
                    // Guardar respuestas del usuario
                    if (userAnswers.value.length <= currentQuestionIndex.value) {
                        userAnswers.value.push([...selectedAnswers.value]);
                    } else {
                        userAnswers.value[currentQuestionIndex.value] = [...selectedAnswers.value];
                    }
                };
                
                const nextQuestion = async () => {
                    showFeedback.value = false;
                    selectedAnswers.value = [];
                    answerIsFullyCorrect.value = false;
                    answerIsPartiallyCorrect.value = false;
                    
                    if (isLastQuestion.value) {
                        finishExam();
                    } else {
                        currentQuestionIndex.value++;
                        if (examConfig.value.protectQuestions) {
                            await updateCurrentQuestionImage();
                        }
                    }
                };
                
                const startTimer = () => {
                    elapsedTime.value = 0;
                    updateTimeLeft();
                    
                    timerInterval.value = setInterval(() => {
                        elapsedTime.value = Math.floor((new Date() - examStartedAt.value) / 1000);
                        updateTimeLeft();
                        
                        if (timeLeft.value <= 0) {
                            finishExam();
                        }
                    }, 1000);
                };
                
                const updateTimeLeft = () => {
                    const now = new Date();
                    timeLeft.value = Math.max(0, Math.floor((examEndTime.value - now) / 1000));
                };
                
                const stopTimer = () => {
                    if (timerInterval.value) {
                        clearInterval(timerInterval.value);
                        timerInterval.value = null;
                    }
                };
                
                const initLeafletMap = () => {
                    if (!examLocation.value) return;
                    
                    // Esperar a que el DOM se actualice
                    nextTick(() => {
                        const mapElement = document.getElementById('leaflet-map');
                        if (!mapElement) return;
                        
                        // Limpiar mapa existente si hay uno
                        if (leafletMap.value) {
                            leafletMap.value.remove();
                        }
                        
                        // Crear nuevo mapa
                        leafletMap.value = L.map('leaflet-map').setView(
                            [examLocation.value.latitude, examLocation.value.longitude], 
                            15
                        );
                        
                        // Añadir capa de OpenStreetMap
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(leafletMap.value);
                        
                        // Añadir marcador
                        if (leafletMarker.value) {
                            leafletMarker.value.remove();
                        }
                        
                        leafletMarker.value = L.marker([examLocation.value.latitude, examLocation.value.longitude])
                            .addTo(leafletMap.value)
                            .bindPopup('Ubicación del examen');
                        
                        // Ajustar el mapa al contenedor
                        leafletMap.value.invalidateSize();
                    });
                };
                
                const generatePDF = async () => {
                    if (!window.jspdf || !window.jspdf.jsPDF) {
                        alert('Error: La funcionalidad de PDF no está disponible. Por favor recarga la página.');
                        return;
                    }
                    
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });
                    
                    // Configurar márgenes y tamaños
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const margin = 10;
                    const contentWidth = pageWidth - margin * 2;
                    
                    // Encabezado del PDF
                    doc.setFontSize(20);
                    doc.setTextColor(94, 53, 177);
                    doc.text('Resultados del Examen', margin, 15);
                    
                    doc.setFontSize(12);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Certificado de Evaluación', margin, 22);
                    
                    // Línea decorativa
                    doc.setDrawColor(94, 53, 177);
                    doc.setLineWidth(0.5);
                    doc.line(margin, 25, pageWidth - margin, 25);
                    
                    // Información del usuario
                    doc.setFontSize(12);
                    doc.setTextColor(0, 0, 0);
                    let yPos = 35;
                    
                    doc.text(`Nombre: ${currentUser.value.nombre}`, margin, yPos);
                    doc.text(`Cédula: ${currentUser.value.ci}`, margin + 70, yPos);
                    yPos += 7;
                    
                    doc.text(`Código: ${currentUser.value.codigo}`, margin, yPos);
                    doc.text(`Intento: ${attemptNumber.value}`, margin + 70, yPos);
                    yPos += 7;
                    
                    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, yPos);
                    yPos += 10;
                    
                    // Resultados en una sola línea
                    doc.setFontSize(14);
                    doc.setTextColor(94, 53, 177);
                    doc.text('Resultados:', margin, yPos);
                    yPos += 8;
                    
                    doc.setFontSize(12);
                    doc.setTextColor(0, 0, 0);
                    
                    // Crear una línea con los tres resultados
                    const resultsLine = [
                        `Puntuación: ${score.value}%`,
                        `Correctas: ${correctAnswersCount.value}/${selectedQuestions.value.length}`,
                        `Tiempo: ${formatTime(elapsedTime.value)}`
                    ];
                    
                    // Calcular posiciones para centrar
                    const colWidth = contentWidth / 3;
                    doc.text(resultsLine[0], margin, yPos);
                    doc.text(resultsLine[1], margin + colWidth, yPos);
                    doc.text(resultsLine[2], margin + colWidth * 2, yPos);
                    yPos += 15;
                    
                    // Información del examen
                    doc.setFontSize(14);
                    doc.setTextColor(94, 53, 177);
                    doc.text('Información del Examen', margin, yPos);
                    yPos += 8;
                    
                    doc.setFontSize(12);
                    doc.text(`Inicio: ${formatDateTime(examStartTime.value)}`, margin, yPos);
                    yPos += 7;
                    
                    doc.text(`Finalización: ${formatDateTime(examFinishTime.value)}`, margin, yPos);
                    yPos += 7;
                    
                    if (examLocation.value) {
                        doc.text(`Ubicación: Lat ${examLocation.value.latitude.toFixed(6)}, Long ${examLocation.value.longitude.toFixed(6)}`, margin, yPos);
                    } else if (locationError.value) {
                        doc.setTextColor(255, 0, 0);
                        doc.text(`Error de ubicación: ${locationError.value}`, margin, yPos);
                        doc.setTextColor(0, 0, 0);
                    }
                    yPos += 10;
                    
                    // Mapa de ubicación
                    if (examLocation.value) {
                        doc.setFontSize(14);
                        doc.setTextColor(94, 53, 177);
                        doc.text('Ubicación aproximada:', margin, yPos);
                        yPos += 8;
                        
                        try {
                            // Crear contenedor temporal para el mapa
                            const mapContainer = document.createElement('div');
                            mapContainer.style.width = '600px';
                            mapContainer.style.height = '200px';
                            mapContainer.style.position = 'absolute';
                            mapContainer.style.left = '-9999px';
                            
                            const mapElement = document.createElement('div');
                            mapElement.id = 'pdf-map';
                            mapElement.style.width = '100%';
                            mapElement.style.height = '100%';
                            
                            mapContainer.appendChild(mapElement);
                            document.body.appendChild(mapContainer);
                            
                            // Crear mapa temporal
                            const tempMap = L.map('pdf-map').setView(
                                [examLocation.value.latitude, examLocation.value.longitude], 
                                15
                            );
                            
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            }).addTo(tempMap);
                            
                            L.marker([examLocation.value.latitude, examLocation.value.longitude])
                                .addTo(tempMap)
                                .bindPopup('Ubicación del examen');
                            
                            // Esperar a que el mapa se cargue
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            const canvas = await html2canvas(mapContainer, {
                                width: 600,
                                height: 200,
                                scale: 1,
                                logging: false,
                                useCORS: true
                            });
                            
                            const mapImage = canvas.toDataURL('image/png');
                            
                            // Añadir mapa al PDF con tamaño adecuado
                            const imgWidth = contentWidth;
                            const imgHeight = (imgWidth * 200) / 600;
                            
                            doc.addImage(mapImage, 'PNG', margin, yPos, imgWidth, imgHeight);
                            yPos += imgHeight + 5;
                            
                            doc.setFontSize(10);
                            doc.setTextColor(100, 100, 100);
                            doc.text('Esta ubicación se incluyó en el certificado', margin, yPos);
                            yPos += 10;
                            
                            document.body.removeChild(mapContainer);
                        } catch (error) {
                            console.error('Error al generar mapa para PDF:', error);
                        }
                    }
                    
                    // Pie de página
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Documento generado automáticamente - Sistema de Examen Interactivo', pageWidth / 2, 287, { align: 'center' });
                    
                    // Descargar inmediatamente
                    const filename = `Resultado_Examen_${currentUser.value.nombre.replace(' ', '_')}_Intento_${attemptNumber.value}.pdf`;
                    doc.save(filename);
                    
                    showDownloadNotification.value = true;
                    setTimeout(() => {
                        showDownloadNotification.value = false;
                    }, 3000);
                };
                
                const downloadResults = () => {
                    generatePDF();
                };
                
                const downloadPreviousExam = () => {
                    if (!examResults.value) return;
                    
                    selectedQuestions.value = questionBank.value.slice(0, examResults.value.totalQuestions);
                    userAnswers.value = examResults.value.answers;
                    elapsedTime.value = examResults.value.time;
                    attemptNumber.value = examResults.value.attempt;
                    examStartTime.value = new Date(examResults.value.startTime);
                    examFinishTime.value = new Date(examResults.value.finishTime);
                    examLocation.value = examResults.value.location;
                    locationError.value = examResults.value.locationError;
                    
                    generatePDF();
                };
                
                const finishExam = async () => {
                    examFinishTime.value = new Date();
                    stopTimer();
                    currentScreen.value = 'results';
                    lastExamScore.value = score.value;
                    
                    examResults.value = {
                        userId: currentUser.value.codigo,
                        nombre: currentUser.value.nombre,
                        ci: currentUser.value.ci,
                        correo: currentUser.value.correo,
                        attempt: attemptNumber.value,
                        score: score.value,
                        correctAnswers: correctAnswersCount.value,
                        totalQuestions: selectedQuestions.value.length,
                        time: elapsedTime.value,
                        date: new Date().toISOString(),
                        answers: userAnswers.value,
                        startTime: examStartTime.value.toISOString(),
                        finishTime: examFinishTime.value.toISOString(),
                        location: examLocation.value,
                        locationError: locationError.value
                    };
                    
                    Cookies.set(`completed_${currentUser.value.codigo}`, 'true', { expires: 365 });
                    Cookies.set(`results_${currentUser.value.codigo}`, JSON.stringify(examResults.value), { expires: 365 });
                    
                    hasCompletedExam.value = true;
                    
                    // Inicializar mapa Leaflet
                    initLeafletMap();
                };
                
                const formatDateTime = (date) => {
                    if (!date) return "No disponible";
                    return date.toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                };
                
                const toggleAdmin = () => {
                    isAdmin.value = !isAdmin.value;
                    showConfig.value = isAdmin.value;
                    
                    if (isAdmin.value) {
                        currentUser.value = users.value.find(u => u.codigo === 'ADMIN');
                    } else {
                        currentUser.value = null;
                        currentScreen.value = 'code';
                    }
                };
                
                const saveConfig = () => {
                    showConfig.value = false;
                    if (developmentMode) {
                        localStorage.setItem('examConfig', JSON.stringify(examConfig.value));
                    }
                    alert('Configuración guardada exitosamente');
                };
                
                const formatCountdown = (ms) => {
                    if (ms <= 0) return "00:00:00";
                    const totalSeconds = Math.floor(ms / 1000);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                };
                
                const formatTime = (seconds) => {
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                };
                
                const updateTimeUntilStart = () => {
                    const now = new Date();
                    const [startHours, startMins] = examConfig.value.startTime.split(':').map(Number);
                    const [endHours, endMins] = examConfig.value.endTime.split(':').map(Number);
                    
                    const startTime = new Date();
                    startTime.setHours(startHours, startMins, 0, 0);
                    
                    const endTime = new Date();
                    endTime.setHours(endHours, endMins, 0, 0);
                    
                    const newTimeUntilStart = Math.max(0, startTime - now);
                    const newTimeUntilEnd = Math.max(0, endTime - now);
                    
                    if (newTimeUntilStart !== timeUntilStart.value || newTimeUntilEnd !== timeUntilEnd.value) {
                        timeUntilStart.value = newTimeUntilStart;
                        timeUntilEnd.value = newTimeUntilEnd;
                    }
                };
                
                const startTimeChecker = () => {
                    if (timeUpdateInterval.value) {
                        clearInterval(timeUpdateInterval.value);
                    }
                    
                    timeUpdateInterval.value = setInterval(() => {
                        updateTimeUntilStart();
                    }, 1000);
                    
                    updateTimeUntilStart();
                };
                
                const shuffleArray = (array) => {
                    const newArray = [...array];
                    for (let i = newArray.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
                    }
                    return newArray;
                };

                // Inicialización
                onMounted(() => {
                    if (developmentMode) {
                        const savedConfig = localStorage.getItem('examConfig');
                        if (savedConfig) {
                            examConfig.value = JSON.parse(savedConfig);
                        }
                    }
                    
                    startTimeChecker();
                    
                    // Deshabilitar atajos de teclado
                    document.addEventListener('keydown', (e) => {
                        // Bloquear Ctrl+C, Ctrl+A, etc.
                        if (e.ctrlKey && ['c', 'C', 'x', 'X', 'a', 'A'].includes(e.key)) {
                            e.preventDefault();
                        }
                        // Bloquear F12
                        if (e.key === 'F12') {
                            e.preventDefault();
                        }
                    });
                    
                    // Deshabilitar clic derecho
                    document.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                    });
                });

                // Limpieza
                onUnmounted(() => {
                    stopTimer();
                    if (timeUpdateInterval.value) {
                        clearInterval(timeUpdateInterval.value);
                    }
                    if (leafletMap.value) {
                        leafletMap.value.remove();
                    }
                });

                return {
                    currentScreen,
                    enteredCode,
                    isCodeBlocked,
                    countdown,
                    currentUser,
                    selectedQuestions,
                    currentQuestionIndex,
                    selectedAnswers,
                    showFeedback,
                    answerIsFullyCorrect,
                    answerIsPartiallyCorrect,
                    userAnswers,
                    elapsedTime,
                    attemptNumber,
                    isAdmin,
                    showConfig,
                    examConfig,
                    timeLeft,
                    timeUntilStart,
                    timeUntilEnd,
                    hasCompletedExam,
                    lastExamScore,
                    showDownloadNotification,
                    developmentMode,
                    currentQuestion,
                    isLastQuestion,
                    correctAnswersText,
                    correctAnswersCount,
                    score,
                    isExamTime,
                    examLocation,
                    examStartTime,
                    examFinishTime,
                    locationError,
                    currentQuestionImage,
                    showLocationModal,
                    verifyCode,
                    verifyAndStartExam,
                    requestLocation,
                    cancelExam,
                    startExamAfterLocation,
                    toggleAnswer,
                    checkAnswer,
                    nextQuestion,
                    downloadResults,
                    downloadPreviousExam,
                    formatTime,
                    formatCountdown,
                    formatDateTime,
                    toggleAdmin,
                    saveConfig,
                    isQuestionFullyCorrect
                };
            }
        }).mount('#app');
    </script>
</body>
</html>
