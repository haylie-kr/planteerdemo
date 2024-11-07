document.addEventListener('DOMContentLoaded', () => {
    const btns = document.querySelectorAll('.faq__btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const faqItem = btn.closest('.faq'); 
            const isActive = faqItem.classList.contains('active'); 

            removeActiveClasses();

            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
    function removeActiveClasses() {
        btns.forEach(btn => {
            btn.closest('.faq').classList.remove('active');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const btns = document.querySelectorAll('.cronjob__btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const faqItem = btn.closest('.cronjob'); 
            const isActive = faqItem.classList.contains('active'); 

            removeActiveClasses();

            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
    function removeActiveClasses() {
        btns.forEach(btn => {
            btn.closest('.cronjob').classList.remove('active');
        });
    }
});