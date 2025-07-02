// ===========================
// DOM Content Loaded
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // GSAP初期化
    gsap.registerPlugin(ScrollTrigger);
    
    // アニメーション初期化
    initializeAnimations();
    
    // FAQ アコーディオンの初期化
    initializeFAQ();
    
    // モーダルの初期化
    initializeModal();
    
    // スティッキーフッターの初期化
    initializeStickyFooter();
    
    // スムーススクロールの初期化
    initializeSmoothScroll();
    
    // クリニックロゴスクロールの初期化
    initializeClinicLogoScroll();
});

// ===========================
// GSAP Animations
// ===========================

function initializeAnimations() {
    // テキストを一文字ずつ分割する関数
    function splitTextToChars(element) {
        const text = element.textContent;
        element.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            if (char === ' ') {
                span.innerHTML = '&nbsp;'; // スペースを保持
            }
            element.appendChild(span);
        }
        
        return element.children;
    }

    // ヒーローセクションのテキストアニメーション
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    // テキストを一文字ずつ分割
    const titleChars = splitTextToChars(heroTitle);
    const subtitleChars = splitTextToChars(heroSubtitle);
    
    // タイムラインを作成
    const heroTL = gsap.timeline();
    
    // タイトルの一文字ずつアニメーション
    heroTL.from(titleChars, {
        duration: 2,
        y: -30,  // 上から出現
        opacity: 0,
        stagger: 0.05,  // 0.05秒間隔で順次表示
        ease: 'power3.out'
    })
    // サブタイトルの一文字ずつアニメーション  
    .from(subtitleChars, {
        duration: 1.2,
        y: -20,  // 上から出現
        opacity: 0,
        stagger: 0.03,  // 0.03秒間隔で順次表示
        ease: 'power3.out'
         }, '-=0.3')
     // CTAボタンのアニメーション
     .fromTo('.hero-cta .cta-button', {
         x: 100,  // 右側の位置からスタート
         opacity: 0,  // 非表示からスタート
         scale: 1  // スケールを明確に設定
     }, {
         duration: 0.8,  // 少しゆっくりに
         x: 0,  // 中央の位置
         opacity: 1,  // 表示
         scale: 1,  // 通常サイズ
         ease: 'power3.out'
     }, '-=0.2');

    // セクションタイトルのアニメーション
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power3.out'
        });
    });

    // プロブレムアイテムのスタガーアニメーション
    gsap.from('.problem-item', {
        scrollTrigger: {
            trigger: '.problems-list',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.6,
        y: 30,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // Before/Afterのアニメーション
    gsap.from('.before', {
        scrollTrigger: {
            trigger: '.before-after',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        x: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.after', {
        scrollTrigger: {
            trigger: '.before-after',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        x: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.3
    });

    gsap.from('.arrow', {
        scrollTrigger: {
            trigger: '.before-after',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.6,
        scale: 0,
        opacity: 0,
        ease: 'back.out(1.7)',
        delay: 0.6
    });

    // Stepsのアニメーション
    gsap.from('.step', {
        scrollTrigger: {
            trigger: '.steps',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.3,
        ease: 'power3.out'
    });

    // ベネフィットカードのアニメーション
    gsap.from('.benefit-card', {
        scrollTrigger: {
            trigger: '.benefits-grid',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // 証言カードのアニメーション
    gsap.from('.testimonial-card', {
        scrollTrigger: {
            trigger: '.testimonial-grid',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.3,
        ease: 'power3.out'
    });

    // USPカードのアニメーション
    gsap.from('.usp-card', {
        scrollTrigger: {
            trigger: '.usp-grid',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // 価格カードのアニメーション
    gsap.from('.pricing-card', {
        scrollTrigger: {
            trigger: '.pricing-card',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)'
    });

    // FAQアイテムのアニメーション
    gsap.from('.faq-item', {
        scrollTrigger: {
            trigger: '.faq-list',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.6,
        y: 30,
        opacity: 0,
        stagger: 0.15,
        ease: 'power3.out'
    });

    // クロージングセクションのアニメーション
    gsap.from('.closing-text', {
        scrollTrigger: {
            trigger: '.closing',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.closing-cta', {
        scrollTrigger: {
            trigger: '.closing',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.3
    });

    // CTAボタンのホバーアニメーション（ヒーローセクション以外）
    document.querySelectorAll('.cta-button').forEach(button => {
        // ヒーローセクション内のCTAボタンは除外
        if (button.closest('.hero-cta')) return;
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('animating')) {
                button.classList.add('animating');
                gsap.to(button, {
                    duration: 0.3,
                    scale: 1.05,
                    ease: 'power2.out',
                    onComplete: () => button.classList.remove('animating')
                });
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('animating')) {
                button.classList.add('animating');
                gsap.to(button, {
                    duration: 0.3,
                    scale: 1,
                    ease: 'power2.out',
                    onComplete: () => button.classList.remove('animating')
                });
            }
        });
    });

    // カードのホバーアニメーション
    document.querySelectorAll('.benefit-card, .testimonial-card, .usp-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.3,
                y: -10,
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                y: 0,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                ease: 'power2.out'
            });
        });
    });
}

// ===========================
// FAQ Accordion
// ===========================

function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // すべてのFAQアイテムを閉じる
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    gsap.to(otherAnswer, {
                        duration: 0.3,
                        maxHeight: 0,
                        ease: 'power2.inOut'
                    });
                }
            });
            
            // クリックされたアイテムを開く/閉じる
            if (isActive) {
                item.classList.remove('active');
                gsap.to(answer, {
                    duration: 0.3,
                    maxHeight: 0,
                    ease: 'power2.inOut'
                });
            } else {
                item.classList.add('active');
                gsap.set(answer, { maxHeight: 'none' });
                const height = answer.scrollHeight;
                gsap.fromTo(answer, 
                    { maxHeight: 0 },
                    { 
                        duration: 0.3,
                        maxHeight: height + 'px',
                        ease: 'power2.inOut'
                    }
                );
            }
        });
    });
}

// ===========================
// Modal Management
// ===========================

function initializeModal() {
    const modal = document.getElementById('contact-modal');
    const modalTriggers = document.querySelectorAll('.cta-button.secondary');
    const modalClose = document.querySelector('.modal-close');
    const contactForm = document.getElementById('contact-form');

    // モーダルを開く
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    // モーダルを閉じる
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    function openModal() {
        document.body.classList.add('no-scroll');
        modal.style.display = 'flex';
        
        gsap.timeline()
            .to(modal, {
                duration: 0.3,
                opacity: 1,
                ease: 'power2.out'
            })
            .fromTo('.modal-content', 
                { scale: 0.8, opacity: 0 },
                { 
                    duration: 0.4,
                    scale: 1,
                    opacity: 1,
                    ease: 'back.out(1.7)'
                },
                '-=0.1'
            );
        
        setTimeout(() => modal.classList.add('show'), 10);
    }

    function closeModal() {
        gsap.timeline()
            .to('.modal-content', {
                duration: 0.3,
                scale: 0.8,
                opacity: 0,
                ease: 'power2.in'
            })
            .to(modal, {
                duration: 0.2,
                opacity: 0,
                ease: 'power2.in',
                onComplete: () => {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    document.body.classList.remove('no-scroll');
                }
            }, '-=0.1');
    }

    // フォーム送信の処理
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // フォームバリデーション
        const formData = new FormData(contactForm);
        const clinicName = formData.get('clinic-name');
        const doctorName = formData.get('doctor-name');
        const email = formData.get('email');

        if (!clinicName || !doctorName || !email) {
            alert('必須項目をすべて入力してください。');
            return;
        }

        // メールアドレスの簡単なバリデーション
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('正しいメールアドレスを入力してください。');
            return;
        }

        // 送信処理（実際のプロダクションでは適切なエンドポイントに送信）
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = '送信中...';
        submitButton.disabled = true;

        // 実際の送信処理をここに追加
        setTimeout(() => {
            alert('資料請求を受け付けました。ありがとうございます！');
            contactForm.reset();
            closeModal();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    });
}

// ===========================
// Sticky Footer
// ===========================

function initializeStickyFooter() {
    const stickyFooter = document.getElementById('sticky-footer');
    const heroSection = document.getElementById('hero');
    const closingSection = document.getElementById('closing');
    
    let showFooter = false;
    
    // ヒーローセクションが見えなくなったらフッター表示
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // ヒーローセクションが見えている間は非表示
                showFooter = false;
                stickyFooter.style.transform = 'translateX(-50%) translateY(100%)';
            } else {
                // ヒーローセクションが見えなくなったら表示可能
                showFooter = true;
                updateFooterVisibility();
            }
        });
    }, {
        threshold: 0.1
    });
    
    // クロージングセクションが見えている間は非表示
    const closingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            updateFooterVisibility();
        });
    }, {
        threshold: 0.1
    });
    
    function updateFooterVisibility() {
        const closingVisible = closingSection && 
            closingSection.getBoundingClientRect().top < window.innerHeight;
        
        if (showFooter && !closingVisible) {
            // 少し遅延してからレイアウト計算
            setTimeout(() => {
                requestAnimationFrame(() => {
                    // レイアウトを強制再計算
                    stickyFooter.offsetHeight;
                    const content = stickyFooter.querySelector('.sticky-footer-content');
                    if (content) {
                        content.offsetWidth; // 幅計算を強制
                    }
                    requestAnimationFrame(() => {
                        // 中央配置を明示的に強制
                        stickyFooter.style.display = 'block';
                        stickyFooter.style.transform = 'translateX(-50%) translateY(0%)';
                        // フレックスボックスの再計算を強制
                        if (content) {
                            content.style.display = 'flex';
                        }
                    });
                });
            }, 100); // 100ms遅延
        } else {
            stickyFooter.style.transform = 'translateX(-50%) translateY(100%)';
        }
    }

    if (heroSection) {
        heroObserver.observe(heroSection);
    }
    
    if (closingSection) {
        closingObserver.observe(closingSection);
    }
}

// ===========================
// Smooth Scroll
// ===========================

function initializeSmoothScroll() {
    // 内部リンクのスムーススクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // ヘッダー分のオフセット
                
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: offsetTop,
                        autoKill: false
                    },
                    ease: 'power2.inOut'
                });
            }
        });
    });
}

// ===========================
// Utility Functions
// ===========================

// 数値のカウントアップアニメーション
function animateCounter(element, endValue, duration = 2) {
    const obj = { value: 0 };
    
    gsap.to(obj, {
        duration: duration,
        value: endValue,
        ease: 'power2.out',
        onUpdate: () => {
            element.textContent = Math.round(obj.value).toLocaleString();
        }
    });
}

// レスポンシブ対応のチェック
function checkResponsive() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet
    };
}

// パフォーマンス最適化のための遅延読み込み
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// ページロード完了時の追加処理
window.addEventListener('load', () => {
    // 遅延読み込みの初期化
    initializeLazyLoading();
    
    // パフォーマンス測定
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
});

// ===========================
// Clinic Logo Scroll
// ===========================

function initializeClinicLogoScroll() {
    const scrollContainer = document.querySelector('.clinic-logo-scroll');
    if (!scrollContainer) return;

    const images = scrollContainer.querySelectorAll('img');
    const totalImages = images.length;
    const originalImageCount = totalImages / 2; // 7枚（複製を除く）
    
    // 全ての画像が読み込まれるまで待つ
    Promise.all(
        Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        })
    ).then(() => {
        // 最初の7枚の画像の幅を計算
        let totalWidth = 0;
        const gapInPx = parseFloat(getComputedStyle(scrollContainer).gap) || 32; // 2rem = 32px (default)
        
        for (let i = 0; i < originalImageCount; i++) {
            totalWidth += images[i].offsetWidth;
            // 7枚すべてに対してgapを追加（最後の画像と2回目先頭の間のgapも含む）
            totalWidth += gapInPx;
        }
        
        // CSS変数として設定
        scrollContainer.style.setProperty('--scroll-distance', `-${totalWidth}px`);
        
        // アニメーションを開始
        scrollContainer.style.animation = 'clinic-scroll 40s linear infinite';
        
        console.log(`Clinic logo scroll initialized: ${totalWidth}px distance`);
    });
}

// リサイズ時の処理
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // ScrollTriggerのリフレッシュ
        ScrollTrigger.refresh();
        
        // クリニックロゴスクロールも再計算
        initializeClinicLogoScroll();
    }, 250);
});