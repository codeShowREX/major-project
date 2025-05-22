import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Input from "../components/Input";
import { Lock, AlertCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { resetPassword, error, isLoading, message } = useAuthStore();
	const { token } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [isValidToken, setIsValidToken] = useState(true);

	useEffect(() => {
		// Handle HTTPS to HTTP redirection in development
		if (import.meta.env.MODE === 'development' && window.location.protocol === 'https:') {
			setIsRedirecting(true);
			const port = window.location.port ? `:${window.location.port}` : '';
			const httpUrl = `http://${window.location.hostname}${port}${location.pathname}`;
			console.log('Redirecting from HTTPS to HTTP:', httpUrl);
			
			// Try to redirect using replace
			try {
				window.location.replace(httpUrl);
			} catch (error) {
				console.error('Error during redirect:', error);
				// If replace fails, try href
				window.location.href = httpUrl;
			}
			return;
		}

		// Validate token on component mount
		if (!token) {
			setIsValidToken(false);
			toast.error("Invalid or missing reset token");
			setTimeout(() => navigate("/forgot-password"), 2000);
		}
	}, [location, token, navigate]);

	useEffect(() => {
		// Show error toast if there's an error
		if (error) {
			toast.error(error);
			if (error.includes("invalid") || error.includes("expired")) {
				setIsValidToken(false);
				setTimeout(() => navigate("/forgot-password"), 2000);
			}
		}
		// Show success message if there's a message
		if (message) {
			toast.success(message);
		}
	}, [error, message, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		try {
			await resetPassword(token, password);
			toast.success("Password reset successfully, redirecting to login page...");
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error) {
			console.error(error);
			// Error is already handled by the store and shown via toast
		}
	};

	// Show loading state while redirecting
	if (isRedirecting) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden p-8'
			>
				<div className='flex items-center justify-center mb-4'>
					<Loader className='h-12 w-12 text-green-500 animate-spin' />
				</div>
				<h2 className='text-2xl font-bold mb-4 text-center text-green-500'>
					Redirecting...
				</h2>
				<p className='text-gray-300 text-center mb-6'>
					Please wait while we redirect you to the secure password reset page...
				</p>
			</motion.div>
		);
	}

	// Show error state for invalid token
	if (!isValidToken) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden p-8'
			>
				<div className='flex items-center justify-center mb-4'>
					<AlertCircle className='h-12 w-12 text-red-500' />
				</div>
				<h2 className='text-2xl font-bold mb-4 text-center text-red-500'>
					Invalid Reset Link
				</h2>
				<p className='text-gray-300 text-center mb-6'>
					This password reset link is invalid or has expired. Please request a new one.
				</p>
				<button
					onClick={() => navigate("/forgot-password")}
					className='w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200'
				>
					Request New Reset Link
				</button>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
					Reset Password
				</h2>

				<form onSubmit={handleSubmit}>
					<Input
						icon={Lock}
						type='password'
						placeholder='New Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						minLength={6}
					/>

					<Input
						icon={Lock}
						type='password'
						placeholder='Confirm New Password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						minLength={6}
					/>

					<button
						type='submit'
						disabled={isLoading}
						className='w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center'
					>
						{isLoading ? (
							<>
								<Loader className='w-5 h-5 mr-2 animate-spin' />
								Resetting Password...
							</>
						) : (
							'Reset Password'
						)}
					</button>
				</form>
			</div>
		</motion.div>
	);
};

export default ResetPasswordPage;
