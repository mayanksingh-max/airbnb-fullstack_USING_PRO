import { Link } from 'react-router-dom';
import { FiHome, FiTwitter, FiFacebook, FiInstagram, FiYoutube, FiMail } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Support: [
      { label: 'Help Center', href: '#' },
      { label: 'Safety Information', href: '#' },
      { label: 'Cancellation Options', href: '#' },
      { label: 'Our COVID-19 Response', href: '#' },
    ],
    Community: [
      { label: 'StayHub Blog', href: '#' },
      { label: 'Diversity & Belonging', href: '#' },
      { label: 'Against Discrimination', href: '#' },
      { label: 'Invite Friends', href: '#' },
    ],
    Hosting: [
      { label: 'Try Hosting', href: '/add-property' },
      { label: 'Host Resources', href: '#' },
      { label: 'Community Forum', href: '#' },
      { label: 'Responsible Hosting', href: '#' },
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Investors', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg airbnb-gradient flex items-center justify-center">
              <FiHome className="text-white text-sm" />
            </div>
            <span className="font-bold text-primary-500 font-display">StayHub</span>
            <span className="text-gray-400 text-sm ml-4">© {currentYear} StayHub, Inc.</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-gray-900 transition-colors">Sitemap</a>
          </div>

          <div className="flex items-center gap-4">
            {[FiTwitter, FiFacebook, FiInstagram, FiYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary-500 hover:border-primary-200 transition-all duration-200 hover:shadow-sm"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
