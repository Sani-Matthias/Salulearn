import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleCloseModal = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <AuthModal
        isOpen={true}
        onClose={handleCloseModal}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default LoginPage;
