// スムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ヘッダーのスクロール効果
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        return;
    }
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        // 下にスクロール
        header.style.transform = 'translateY(-100%)';
    } else {
        // 上にスクロール
        header.style.transform = 'translateY(0)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// モバイルメニュートグル
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // アニメーション
        const spans = navToggle.querySelectorAll('span');
        if (navToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
}

// スクロールアニメーション（要素が表示されたときにフェードイン）
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // 遅延アニメーションで順番に表示
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animated');
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// アニメーション対象の要素を設定
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.story-content, .commitment-item, .product-card, .news-item');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
    
    // 商品カードに個別の遅延を追加
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.05}s`;
    });
});

// パララックス効果（ヒーローセクション）
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            
            if (hero && scrolled < window.innerHeight) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                hero.style.opacity = 1 - (scrolled / window.innerHeight * 0.8);
            }
            
            // ストーリー画像にもパララックス効果
            document.querySelectorAll('.story-image').forEach((img, index) => {
                const rect = img.getBoundingClientRect();
                const scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
                if (scrollPercent > 0 && scrollPercent < 1) {
                    const moveAmount = (scrollPercent - 0.5) * 50;
                    img.style.transform = `translateY(${moveAmount}px)`;
                }
            });
            
            ticking = false;
        });
        ticking = true;
    }
});

// マウス追従効果（商品カード）
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `translateY(-10px) scale(1.02) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1) perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// ローディングアニメーション
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// モバイルメニューのスタイル追加（CSS補完）
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 968px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            gap: 20px;
        }
    }
`;
document.head.appendChild(style);

// ヘッダーにトランジション追加
header.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

// 注文モーダル制御
const modal = document.getElementById('order-modal');
const closeModal = document.querySelector('.close-modal');
const orderForm = document.getElementById('order-form');

// 注文ボタンクリック時
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-order')) {
        e.preventDefault();
        
        // 商品情報の取得
        const card = e.target.closest('.product-info');
        const productName = card.querySelector('h4').textContent;
        const price = card.querySelector('.price').textContent;
        
        // フォームにセット
        document.getElementById('order-product').value = productName;
        document.getElementById('order-price').value = price;
        document.getElementById('order-quantity').value = 1;
        
        // モーダル表示
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 背景スクロール防止
    }
});

// モーダルを閉じる
if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });
}

// 背景クリックで閉じる
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
});

// フォーム送信（メール作成）
if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const product = document.getElementById('order-product').value;
        const price = document.getElementById('order-price').value;
        const quantity = document.getElementById('order-quantity').value;
        const name = document.getElementById('order-name').value;
        const address = document.getElementById('order-address').value;
        const phone = document.getElementById('order-phone').value;
        
        // メール本文作成
        const subject = `【注文】${product}`;
        const body = `
以下の内容で注文します。

■ご注文商品
商品名：${product}
価格：${price}
数量：${quantity}

■お客様情報
お名前：${name}
ご住所：${address}
電話番号：${phone}

--------------------------------
※このメールを送信して注文を確定してください。
※店舗からの返信をお待ちください。
        `.trim();
        
        // mailtoリンクを開く
        // 実際のメールアドレスに変更してください
        const mailTo = `mailto:runo.handmade@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailTo;
        
        // モーダルを閉じる
        modal.style.display = 'none';
        document.body.style.overflow = '';
        alert('メールソフトが起動します。メールを送信して注文を完了してください。');
    });
}
