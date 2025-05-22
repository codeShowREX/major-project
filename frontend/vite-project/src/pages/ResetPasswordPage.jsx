import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Input from "../components/Input";
import { Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { resetPassword, error, isLoading, message } = useAuthStore();
	const { token } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const [showRedirectMessage, setShowRedirectMessage] = useState(false);

	useEffect(() => {
		// If the URL is using HTTPS, show redirect message and attempt redirect
		if (window.location.protocol === 'https:') {
			setShowRedirectMessage(true);
			// Ensure we keep the port number in development
			const port = window.location.port ? `:${window.location.port}` : '';
			const httpUrl = `http://${window.location.hostname}${port}${location.pathname}`;
			console.log('Redirecting to:', httpUrl);
			window.location.href = httpUrl;
		}
	}, [location]);

	useEffect(() => {
		// Show error toast if there's an error
		if (error) {
			toast.error(error);
		}
		// Show success message if there's a message
		if (message) {
			toast.success(message);
		}
	}, [error, message]);

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

	// Show redirect message if needed
	if (showRedirectMessage) {
		const port = window.location.port ? `:${window.location.port}` : '';
		const httpUrl = `http://${window.location.hostname}${port}${location.pathname}`;
		
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden p-8'
			>
				<div className='flex items-center justify-center mb-4'>
					<AlertCircle className='h-12 w-12 text-yellow-500' />
				</div>
				<h2 className='text-2xl font-bold mb-4 text-center text-yellow-500'>
					Redirecting to Secure Page
				</h2>
				<p className='text-gray-300 text-center mb-6'>
					Please wait while we redirect you to the secure password reset page...
				</p>
				<p className='text-gray-400 text-sm text-center'>
					If you are not redirected automatically, please click the link below:
				</p>
				<a
					href={httpUrl}
					className='mt-4 block text-center text-green-400 hover:text-green-300 underline'
				>
					Click here to continue
				</a>
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

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
						type='submit'
						disabled={isLoading}
					>
						{isLoading ? "Resetting..." : "Set New Password"}
					</motion.button>
				</form>
			</div>
		</motion.div>
	);
};

export default ResetPasswordPage;
