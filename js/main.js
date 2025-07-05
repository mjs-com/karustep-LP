// ===========================
// DOM Content Loaded
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // GSAP初期化
    gsap.registerPlugin(ScrollTrigger);
    
    // すべてのアニメーションを初期化
    initializeHeroAnimations();
    initializeFAQ();
    initializeStickyFooter();
    initializeSmoothScroll();
    initializeClinicLogoScroll();
    initializeScrollAnimations();
});

// ===========================
// GSAP Animations
// ===========================

function initializeHeroAnimations() {
    // テキストを一文字ずつ分割する関数（ハイライトクラスを保持）
    function splitTextToChars(element) {
        const chars = [];
        const childNodes = Array.from(element.childNodes);
        
        // 元の内容をクリア
        element.innerHTML = '';
        
        // 各子ノードを処理
        childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                // 通常のテキストノード
                const text = node.textContent;
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.style.display = 'inline-block';
                    
                    if (char === ' ') {
                        span.innerHTML = '&nbsp;';
                    }
                    
                    element.appendChild(span);
                    chars.push(span);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('highlight-text')) {
                // ハイライトテキストノード
                const text = node.textContent;
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.style.display = 'inline-block';
                    span.classList.add('highlight-text'); // ハイライトクラスを追加
                    
                    if (char === ' ') {
                        span.innerHTML = '&nbsp;';
                    }
                    
                    element.appendChild(span);
                    chars.push(span);
                }
            }
        });
        
        return chars;
    }

    // ヒーローセクションのテキストアニメーション
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle && heroSubtitle) {
        // テキストを一文字ずつ分割
        const titleChars = splitTextToChars(heroTitle);
        const subtitleChars = splitTextToChars(heroSubtitle);
        
        // タイムラインを作成
        const heroTL = gsap.timeline();
        
        // タイトルの一文字ずつアニメーション
        heroTL.from(titleChars, {
            duration: 1.5,
            y: -30,
            opacity: 0,
            stagger: 0.05,
            ease: 'power3.out'
        })
        // サブタイトルの一文字ずつアニメーション  
        .from(subtitleChars, {
            duration: 0.8,
            y: -20,
            opacity: 0,
            stagger: 0.03,
            ease: 'power3.out'
        }, '-=0.3')
        // CTAボタンのアニメーション
        .fromTo('.hero-cta .cta-button', {
            y: 10,
            opacity: 0,
            scale: 1
        }, {
            duration: 0.8,
            y: 0,
            opacity: 1,
            scale: 1,
            ease: 'power3.out'
        }, '-=0.2');
    }
}

function initializeScrollAnimations() {
    // セクションタイトルのアニメーション
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power3.out'
        });
    });

    // 解決策セクションの矢印アニメーション
    gsap.from('.solution .arrow img', {
        scrollTrigger: {
            trigger: '.solution .arrow',
            start: 'top 70%', // 要素の上端がビューポートの80%の位置に来たら開始
            toggleActions: 'play none none none' // 1回だけ再生
        },
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });

    // Stepsのアニメーション
    gsap.utils.toArray('.step').forEach((step, index) => {
        gsap.from(step, {
            scrollTrigger: {
                trigger: step,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 50,
            opacity: 0,
            delay: index * 0.2,
            ease: 'power3.out'
        });
    });

    // ベネフィットカードのアニメーション
    gsap.utils.toArray('.benefit-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 50,
            opacity: 0,
            delay: index * 0.2,
            ease: 'power3.out'
        });
    });

    // 証言カードのアニメーション
    gsap.utils.toArray('.testimonial-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 50,
            opacity: 0,
            delay: index * 0.3,
            ease: 'power3.out'
        });
    });

    // USPカードのアニメーション
    gsap.utils.toArray('.usp-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 50,
            opacity: 0,
            delay: index * 0.2,
            ease: 'power3.out'
        });
    });

    // 価格カードのアニメーション
    if (document.querySelector('.pricing-card')) {
        gsap.from('.pricing-card', {
            scrollTrigger: {
                trigger: '.pricing-card',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 1,
            scale: 0.8,
            opacity: 0,
            ease: 'back.out(1.7)'
        });
    }

    // FAQアイテムのアニメーション
    gsap.utils.toArray('.faq-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.6,
            y: 30,
            opacity: 0,
            delay: index * 0.15,
            ease: 'power3.out'
        });
    });

    // クロージングセクションのアニメーション
    if (document.querySelector('.closing-text')) {
        gsap.from('.closing-text', {
            scrollTrigger: {
                trigger: '.closing',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power3.out'
        });
    }

    if (document.querySelector('.closing-cta')) {
        gsap.from('.closing-cta', {
            scrollTrigger: {
                trigger: '.closing',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.3
        });
    }
}

// ===========================
// FAQ Accordion
// ===========================

function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // すべてのFAQアイテムを閉じる
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            gsap.to(otherAnswer, {
                                duration: 0.3,
                                maxHeight: 0,
                                ease: 'power2.inOut'
                            });
                        }
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
        }
    });
}

// ===========================
// Sticky Footer
// ===========================

function initializeStickyFooter() {
    const stickyFooter = document.getElementById('sticky-footer');
    const heroSection = document.getElementById('hero');
    const closingSection = document.getElementById('closing');
    
    if (!stickyFooter) return;
    
    // reviews.htmlページの場合（heroSectionがない場合）
    if (!heroSection) {
        let showFooter = false;
        
        // 少し遅延をつけてフッターを表示開始
        setTimeout(() => {
            showFooter = true;
            updateFooterVisibility();
        }, 1000);
        
        function updateFooterVisibility() {
            const closingVisible = closingSection && 
                closingSection.getBoundingClientRect().top < window.innerHeight;
            
            if (showFooter && !closingVisible) {
                stickyFooter.style.transform = 'translateX(-50%) translateY(0%)';
            } else {
                stickyFooter.style.transform = 'translateX(-50%) translateY(100%)';
            }
        }
        
        // スクロール時にclosingセクションを監視
        window.addEventListener('scroll', updateFooterVisibility);
        
        // closingセクションの監視
        if (closingSection) {
            const closingObserver = new IntersectionObserver(() => {
                updateFooterVisibility();
            }, { threshold: 0.1 });
            
            closingObserver.observe(closingSection);
        }
        
        return;
    }
    
    // index.htmlページの場合（既存のロジック）
    let showFooter = false;
    
    // ヒーローセクションが見えなくなったらフッター表示
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                showFooter = false;
                stickyFooter.style.transform = 'translateX(-50%) translateY(100%)';
            } else {
                showFooter = true;
                updateFooterVisibility();
            }
        });
    }, { threshold: 0.1 });
    
    function updateFooterVisibility() {
        const closingVisible = closingSection && 
            closingSection.getBoundingClientRect().top < window.innerHeight;
        
        if (showFooter && !closingVisible) {
            stickyFooter.style.transform = 'translateX(-50%) translateY(0%)';
        } else {
            stickyFooter.style.transform = 'translateX(-50%) translateY(100%)';
        }
    }

    heroObserver.observe(heroSection);
    
    if (closingSection) {
        const closingObserver = new IntersectionObserver(() => {
            updateFooterVisibility();
        }, { threshold: 0.1 });
        
        closingObserver.observe(closingSection);
    }
}

// ===========================
// Smooth Scroll
// ===========================

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===========================
// Clinic Logo Scroll
// ===========================

function initializeClinicLogoScroll() {
    const scrollContainer = document.querySelector('.clinic-logo-scroll');
    if (!scrollContainer) return;

    const images = scrollContainer.querySelectorAll('img');
    const totalImages = images.length;
    const originalImageCount = totalImages / 2;
    
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
        let totalWidth = 0;
        const gapInPx = parseFloat(getComputedStyle(scrollContainer).gap) || 32;
        
        for (let i = 0; i < originalImageCount; i++) {
            totalWidth += images[i].offsetWidth;
            totalWidth += gapInPx;
        }
        
        scrollContainer.style.setProperty('--scroll-distance', `-${totalWidth}px`);
        scrollContainer.style.animation = 'clinic-scroll 40s linear infinite';
    });
}

// リサイズ時の処理
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
        initializeClinicLogoScroll();
    }, 250);
});