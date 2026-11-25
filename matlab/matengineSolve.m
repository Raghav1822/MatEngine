function response = matengineSolve(operation)
%MATENGINESOLVE Evaluate one reviewed MatEngine example and return JSON.
% Deploy this function to MATLAB Production Server. Do not add eval/exec
% behavior: only the fixed operation names below are accepted.

switch char(operation)
    case 'vibration'
        m = 1.0; c = 1.0; k = 25.0; x0 = 0.05;
        t = linspace(0, 5, 101);
        wn = sqrt(k/m); zeta = c/(2*sqrt(k*m)); wd = wn*sqrt(1-zeta^2);
        y = x0*exp(-zeta*wn*t).*(cos(wd*t) + zeta/sqrt(1-zeta^2)*sin(wd*t));
        x = t; summary = 'Damped free vibration; linear underdamped model with zero initial velocity.';
    case 'beam'
        E = 200e9; I = 8e-6; L = 2.0; q = 1000;
        x = linspace(0, L, 101);
        y = -q*x.^2.*(6*L^2 - 4*L*x + x.^2)./(24*E*I)*1000;
        summary = 'Cantilever beam under uniform static load; Euler-Bernoulli small-deflection model.';
    case 'heat'
        T0 = 90; Tinf = 22; h = 65; A = 0.08; rho = 7800; cp = 500; V = 0.002;
        x = linspace(0, 1800, 101);
        tau = rho*cp*V/(h*A);
        y = Tinf + (T0-Tinf).*exp(-x/tau);
        summary = 'Lumped-capacitance cooling model with constant ambient and convection.';
    case 'calculus'
        x = linspace(0, pi, 101); y = sin(x);
        area = integral(@sin, 0, pi);
        summary = sprintf('Integral of sin(x) over [0, pi] is %.8f.', area);
    case 'linear'
        A = [4 1; 2 3];
        x = [1 2]; y = real(eig(A));
        summary = 'Eigenvalues of the illustrative matrix [4 1; 2 3].';
    case 'optimize'
        f = @(x) (x-3).^2 + 2;
        x = linspace(0, 6, 101); y = f(x);
        [xmin, fmin] = fminbnd(f, 0, 6);
        summary = sprintf('Quadratic minimum at x = %.4f, f(x) = %.4f.', xmin, fmin);
    otherwise
        error('MatEngine:UnsupportedOperation', 'Unsupported solver operation.');
end

response = jsonencode(struct('x', x, 'y', y, 'summary', summary));
end
