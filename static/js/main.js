// QiuLingYan博客站交互脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 使用requestIdleCallback延迟执行非关键功能
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initCodeCopy();
            initSearch();
        }, { timeout: 500 });
        
        requestIdleCallback(() => {
            initSmoothScroll();
            initReadingProgress();
            initAnimations();
        }, { timeout: 1000 });
    } else {
        // 降级处理
        setTimeout(() => {
            initCodeCopy();
            initSearch();
        }, 50);
        
        setTimeout(() => {
            initSmoothScroll();
            initReadingProgress();
            initAnimations();
        }, 100);
    }
    
    // 立即执行关键功能
    initNavbar();
    initBackToTop();
});

// 导航栏滚动效果
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    
    // 设置初始背景色（根据当前主题）
    updateNavbarBackground();
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        updateNavbarOnScroll(currentScrollY);
        
        // 隐藏/显示导航栏
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true }); // 使用passive监听器提高滚动性能
    
    // 监听主题变化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateNavbarBackground();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true
    });
}

function updateNavbarBackground() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        navbar.style.background = 'rgba(26, 32, 44, 0.95)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
}

function updateNavbarOnScroll(scrollY) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (scrollY > 100) {
        updateNavbarBackground();
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            navbar.style.background = 'rgba(26, 32, 44, 0.95)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        }
    }
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
    }, { passive: true });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 代码复制功能
function initCodeCopy() {
    // 查找所有代码块（适配Prism.js）
    const codeBlocks = document.querySelectorAll('pre[class*="language-"] code, pre code');
    
    // 批量处理代码块
    const fragment = document.createDocumentFragment();
    
    codeBlocks.forEach(codeBlock => {
        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.setAttribute('aria-label', '复制代码');
        
        // 将按钮添加到代码块的父元素(pre标签)中
        codeBlock.parentNode.style.position = 'relative';
        codeBlock.parentNode.appendChild(copyButton);
        
        // 添加点击事件
        copyButton.addEventListener('click', function() {
            // 获取代码文本
            const codeText = codeBlock.textContent;
            
            // 复制到剪贴板
            navigator.clipboard.writeText(codeText).then(() => {
                // 复制成功
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.classList.add('copied');
                
                // 3秒后恢复原状态
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.classList.remove('copied');
                }, 3000);
            }).catch(err => {
                console.error('复制失败: ', err);
            });
        });
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
    // 创建进度条元素
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="progress-bar"></div>';
    document.body.appendChild(progressBar);
    
    // 使用节流优化滚动事件处理
    let ticking = false;
    
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        
        progressBar.querySelector('.progress-bar').style.width = progress + '%';
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    }
    
    // 监听滚动事件更新进度条
    window.addEventListener('scroll', () => {
        requestTick();
    }, { passive: true });
}

// 搜索功能
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput || !searchResults) return;
    
    let searchData = [];
    
    // 延迟加载搜索数据
    setTimeout(() => {
        fetch('/search.json')
            .then(response => response.json())
            .then(data => {
                searchData = data;
            })
            .catch(err => console.error('搜索数据加载失败:', err));
    }, 1000);
    
    searchInput.addEventListener('input', debounce((e) => {
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
    }, 300));
    
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