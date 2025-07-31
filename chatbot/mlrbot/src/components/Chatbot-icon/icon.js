import '../../App.css';
import iconImage from '../../images/icon.png';
const Icon = () => {
  return (
    <section className="icon-section">
      <div className="icon-container">
        <div className="icon-content">
          <img src={iconImage} alt="Icon" className="icon-image" />
        </div>
      </div>
    </section>
  );
};

export default Icon;
