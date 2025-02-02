document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');

    // إنشاء عنصر لعرض الرسائل
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    form.parentNode.insertBefore(messageContainer, form.nextSibling);

    // التحقق من صحة البريد الإلكتروني
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    // التحقق من صحة رقم الهاتف
    function validatePhone(phone) {
        const re = /^01[0125][0-9]{8}$/;
        return re.test(phone);
    }

    // دالة لعرض الرسائل
    function showMessage(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="close-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        messageContainer.appendChild(alert);

        // تحريك التنبيه لأعلى بسلاسة
        setTimeout(() => alert.style.transform = 'translateY(0)', 10);

        // إخفاء الرسالة تلقائياً
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-20px)';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // التحقق من المدخلات
        const formData = {
            fullname: form.fullname.value.trim(),
            phone: form.phone.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim()
        };

        // التحقق من الحقول المطلوبة
        if (!formData.fullname || !formData.phone || !formData.email) {
            showMessage('جميع الحقول مطلوبة', 'error');
            return;
        }

        // التحقق من صحة البريد الإلكتروني
        if (!validateEmail(formData.email)) {
            showMessage('الرجاء إدخال بريد إلكتروني صحيح', 'error');
            return;
        }

        // التحقق من صحة رقم الهاتف
        if (!validatePhone(formData.phone)) {
            showMessage('الرجاء إدخال رقم هاتف صحيح', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        try {
            // تغيير حالة الزر
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            submitButton.disabled = true;

            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // عرض رسالة النجاح
            showMessage('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 'success');
            form.reset();

        } catch (error) {
            console.error('Error:', error);
            showMessage('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            // إعادة الزر لحالته الأصلية
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // إضافة مستمعي الأحداث للحقول للتحقق المباشر
    form.email.addEventListener('input', function () {
        this.style.borderColor = validateEmail(this.value) ? '#4CAF50' : '#ff0000';
    });

    form.phone.addEventListener('input', function () {
        this.style.borderColor = validatePhone(this.value) ? '#4CAF50' : '#ff0000';
    });

    // منع إدخال الحروف في حقل الهاتف
    form.phone.addEventListener('keypress', function (e) {
        if (!/^\d$/.test(e.key)) e.preventDefault();
    });
});