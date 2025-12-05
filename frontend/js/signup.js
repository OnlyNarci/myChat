// Tailwind 配置
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#165DFF',
                secondary: '#36CFC9',
                neutral: '#F5F7FA',
                dark: '#1D2129',
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
            },
        }
    }
};

// 密码显示/隐藏切换
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // 切换图标
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
});

// 登录表单处理
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginButton = document.getElementById('loginButton');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 获取表单数据
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    // 简单验证
    if (!username || !password) {
        showError('请输入用户名和密码');
        return;
    }

    if (!email) {
        showError('请输入邮箱');
        return;
    }

    // 准备请求数据
    const requestData = {
        user_name: username,
        password: password,
        email: email,
    };

    // 显示加载状态
    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 登录中...';

    try {
        // 发送注册请求
        const response = await fetch(`./signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            // 登录成功，显示消息并跳转
            showError(result.message, 'green');
            setTimeout(() => {
                window.location.href = './player/login';
            }, 1500);
        } else {
            // 登录失败
            showError(result.message || '注册失败，请检查用户名或密码');
        }
    } catch (error) {
        console.error('注册请求失败:', error);
        showError('未知错误，请联系管理员');
    } finally {
        // 恢复按钮状态
        loginButton.disabled = false;
        loginButton.innerHTML = '<span>注册</span><i class="fa fa-sign-in"></i>';
    }
});

// 显示错误信息
function showError(message, color = 'red') {
    errorMessage.textContent = message;
    errorMessage.className = `text-${color}-500 text-sm mb-4 text-center`;
    errorMessage.classList.remove('hidden');

    // 5秒后自动隐藏非错误消息
    if (color !== 'red') {
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }
}