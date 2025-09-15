// QiuLingYan博客站交互脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initNavbar();
    initBackToTop();
    initCodeCopy();
    initSmoothScroll();
    initReadingProgress();
    initSearch();
    initAnimations();
});

// 导航栏滚动效果
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        }
        
        // 隐藏/显示导航栏
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// 返回顶部按钮
function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 代码块复制功能
function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        const button = createCopyButton();
        
        pre.style.position = 'relative';
        pre.appendChild(button);
        
        button.addEventListener('click', () => {
            copyToClipboard(codeBlock.textContent, button);
        });
    });
}

function createCopyButton() {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '📋';
    button.title = '复制代码';
    button.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
        opacity: 0;
    `;
    
    return button;
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        button.innerHTML = '✅';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = '📋';
            button.style.background = 'rgba(0, 0, 0, 0.7)';
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        button.innerHTML = '❌';
    });
}

// 平滑滚动
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 阅读进度条
function initReadingProgress() {
    if (!document.querySelector('.post-content')) return;
    
    const progressBar = createProgressBar();
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', updateProgressBar);
    
    function createProgressBar() {
        const bar = document.createElement('div');
        bar.className = 'reading-progress';
        bar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            z-index: 1001;
            transition: width 0.1s ease;
        `;
        return bar;
    }
    
    function updateProgressBar() {
        const content = document.querySelector('.post-content');
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const contentHeight = content.offsetHeight;
        const contentTop = content.offsetTop;
        const contentBottom = contentTop + contentHeight;
        
        let progress = 0;
        
        if (scrollTop >= contentTop && scrollTop <= contentBottom) {
            const relativeScroll = scrollTop - contentTop;
            progress = (relativeScroll / contentHeight) * 100;
        } else if (scrollTop > contentBottom) {
            progress = 100;
        }
        
        progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }
}

// 搜索功能
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput || !searchResults) return;
    
    let searchData = [];
    
    // 加载搜索数据
    fetch('/search.json')
        .then(response => response.json())
        .then(data => {
            searchData = data;
        })
        .catch(err => console.error('搜索数据加载失败:', err));
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        const results = searchData.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        displaySearchResults(results, query);
    });
    
    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">没有找到相关文章</div>';
        } else {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item">
                    <a href="${result.url}">
                        <h3>${highlightQuery(result.title, query)}</h3>
                        <p>${highlightQuery(result.description, query)}</p>
                        <small>${result.date}</small>
                    </a>
                </div>
            `).join('');
        }
        
        searchResults.style.display = 'block';
    }
    
    function highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // 点击外部关闭搜索结果
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
}

// 动画效果
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll('.post-card, .post-header, .post-content > *');
    animatedElements.forEach(el => observer.observe(el));
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .post-card {
            opacity: 0;
            transform: translateY(30px);
        }
        
        .post-content > * {
            opacity: 0;
            transform: translateY(20px);
        }
    `;
    document.head.appendChild(style);
}

// 阅读时间计算
function calculateReadingTime() {
    const content = document.querySelector('.post-content');
    if (!content) return;
    
    const text = content.textContent;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    const readingTimeElement = document.querySelector('.reading-time');
    if (readingTimeElement) {
        readingTimeElement.textContent = `${readingTime} 分钟阅读`;
    }
}

// 图片懒加载
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 社交分享
function initSocialShare() {
    const shareButtons = document.querySelectorAll('.share-button');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const url = button.dataset.url;
            const title = button.dataset.title;
            
            if (navigator.share) {
                navigator.share({
                    title: title,
                    url: url
                }).catch(console.error);
            } else {
                // 回退到复制链接
                copyToClipboard(url, button);
            }
        });
    });
}

// 主题切换（预留）
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化阅读时间计算
document.addEventListener('DOMContentLoaded', calculateReadingTime);

// 添加鼠标悬停效果
document.addEventListener('DOMContentLoaded', () => {
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(block => {
        block.addEventListener('mouseenter', () => {
            const button = block.querySelector('.copy-button');
            if (button) button.style.opacity = '1';
        });
        
        block.addEventListener('mouseleave', () => {
            const button = block.querySelector('.copy-button');
            if (button) button.style.opacity = '0';
        });
    });
});