// Коды ошибок и их описания
const ERROR_CODES = {
    'ERR_001': 'Недостаточно средств на счете',
    'ERR_002': 'Превышен лимит перевода',
    'ERR_003': 'Счет получателя заблокирован',
    'ERR_004': 'Неверные реквизиты получателя',
    'ERR_005': 'Техническая ошибка банка',
    'ERR_006': 'Превышено время ожидания',
    'ERR_007': 'Операция временно недоступна',
    'ERR_008': 'Ошибка валидации данных'
};

// Получить случайную ошибку
function getRandomError() {
    const errorCodes = Object.keys(ERROR_CODES);
    const randomCode = errorCodes[Math.floor(Math.random() * errorCodes.length)];
    return {
        code: randomCode,
        description: ERROR_CODES[randomCode]
    };
}

// Имитация API запроса
async function simulateTransfer(recipient, amount, errorsEnabled) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    if (errorsEnabled) {
        const error = getRandomError();
        
        // Возвращаем ошибку с кодом в неявном виде
        // Код ошибки будет в консоли и в заголовках ответа (если бы это был реальный HTTP запрос)
        const errorResponse = {
            success: false,
            message: 'Ошибка перевода',
            // Код ошибки в неявном виде (не показывается пользователю напрямую)
            _errorCode: error.code,
            _errorDescription: error.description,
            _timestamp: new Date().toISOString(),
            _requestId: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        // Логируем в консоль для разработчиков
        console.error('Ошибка перевода:', {
            code: error.code,
            description: error.description,
            recipient: recipient,
            amount: amount,
            timestamp: errorResponse._timestamp,
            requestId: errorResponse._requestId
        });

        // В реальном приложении код ошибки мог бы быть в HTTP заголовках
        // Например: X-Error-Code: ERR_001
        console.log('HTTP Response Headers (имитация):', {
            'X-Error-Code': error.code,
            'X-Error-Type': 'TRANSFER_ERROR',
            'X-Request-ID': errorResponse._requestId
        });
        
        // Отправка события
        if(error.code.toLowerCase() === 'err_001') {
          r46('track', error.code.toLowerCase(), {amount: amount});
        } else if(error.code.toLowerCase() === 'err_003') {
            r46('track', error.code.toLowerCase(), { recipient: recipient });
        } else {
          r46('track', error.code.toLowerCase())
        }

        // Показ попапа
        if (['err_006', 'err_007'].includes(error.code.toLowerCase())) {
            const popupId = error.code.toLowerCase() === 'err_006' ? 1602 : 1603;
            r46('popup', popupId)
        }

        return errorResponse;
    } else {
        // Успешный перевод
        const successResponse = {
            success: true,
            message: `Перевод на сумму ${amount} ₽ успешно выполнен`,
            recipient: recipient,
            amount: amount,
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        };

        console.log('Успешный перевод:', successResponse);
        
        // Отправка события
        r46('track', 'success')
        
        return successResponse;
    }
}

// Обновление статуса тоггла
function updateToggleStatus(checked) {
    const statusElement = document.getElementById('toggleStatus');
    statusElement.textContent = checked ? 'Работают' : 'Не работают';
    statusElement.style.color = checked ? '#dc3545' : '#28a745';
}

// Отображение кода ошибки для разработчиков
function displayErrorCode(errorCode, errorDescription) {
    const errorCodeDisplay = document.getElementById('errorCode');
    if (errorCode) {
        errorCodeDisplay.innerHTML = `
            <span class="code-label">Код ошибки:</span>${errorCode}<br>
            <span class="code-label">Описание:</span>${errorDescription}
        `;
        errorCodeDisplay.classList.add('show');
    } else {
        errorCodeDisplay.classList.remove('show');
    }
}

// Обработка отправки формы
document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;
    const errorsEnabled = document.getElementById('errorToggle').checked;
    const messageElement = document.getElementById('message');
    
    // Очистка предыдущих сообщений
    messageElement.className = 'message';
    messageElement.textContent = '';
    displayErrorCode(null);

    // Показываем индикатор загрузки
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Обработка...';
    submitBtn.disabled = true;

    try {
        const response = await simulateTransfer(recipient, amount, errorsEnabled);
        
        if (response.success) {
            messageElement.textContent = response.message;
            messageElement.classList.add('success');
            displayErrorCode(null);
        } else {
            messageElement.textContent = response.message;
            messageElement.classList.add('error');
            // Показываем код ошибки только в информационной панели для разработчиков
            displayErrorCode(response._errorCode, response._errorDescription);
        }
    } catch (error) {
        messageElement.textContent = 'Произошла непредвиденная ошибка';
        messageElement.classList.add('error');
        console.error('Неожиданная ошибка:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Обработка изменения тоггла
document.getElementById('errorToggle').addEventListener('change', (e) => {
    updateToggleStatus(e.target.checked);
    
    // Очищаем сообщения при изменении тоггла
    const messageElement = document.getElementById('message');
    messageElement.className = 'message';
    messageElement.textContent = '';
    displayErrorCode(null);
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('errorToggle');
    updateToggleStatus(toggle.checked);
    
    console.log('Демо-страница переводов загружена');
    console.log('Коды ошибок будут отображаться в консоли и в информационной панели');
});

