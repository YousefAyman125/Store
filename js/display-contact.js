document.addEventListener('DOMContentLoaded', function() {
    const contactsContainer = document.getElementById('contactsContainer');
    const refreshBtn = document.getElementById('refreshBtn');

    async function fetchContacts() {
        try {
            const response = await fetch('http://localhost:5000/api/contacts');
            if (!response.ok) throw new Error('فشل في جلب البيانات');

            const contacts = await response.json();

            if (contacts.length === 0) {
                contactsContainer.innerHTML = `
                            <div class="loading">
                                لا توجد بيانات للعرض
                            </div>
                        `;
                return;
            }

            const contactsHTML = contacts.map(contact => `
                        <div class="contact-item">
                            <div class="contact-detail">
                                <i class="fas fa-user"></i>
                                <span>${contact.fullname}</span>
                            </div>
                            <div class="contact-detail">
                                <i class="fas fa-phone"></i>
                                <span>${contact.phone}</span>
                            </div>
                            <div class="contact-detail">
                                <i class="fas fa-envelope"></i>
                                <span>${contact.email}</span>
                            </div>
                            <div class="contact-detail">
                                <i class="fas fa-tag"></i>
                                <span>${contact.subject || 'لا يوجد موضوع'}</span>
                            </div>
                            <div class="contact-detail">
                                <i class="fas fa-message"></i>
                                <span>${contact.message || 'لا توجد رسالة'}</span>
                            </div>
                        </div>
                    `).join('');

            contactsContainer.innerHTML = `
                        <div class="contacts-grid">
                            ${contactsHTML}
                        </div>
                    `;
        } catch (error) {
            console.error('Error:', error);
            contactsContainer.innerHTML = `
                        <div class="error">
                            <i class="fas fa-exclamation-triangle"></i>
                            حدث خطأ في تحميل البيانات
                        </div>
                    `;
        }
    }

    fetchContacts();

    refreshBtn.addEventListener('click', () => {
        contactsContainer.innerHTML = `
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        جاري التحميل...
                    </div>
                `;
        fetchContacts();
    });
});