/**
 * Card Component - Recipe display and content container
 *
 * Features:
 * - Image area with proper aspect ratio
 * - Content area for text
 * - Optional actions area
 * - 12px border radius
 * - Subtle shadow with hover elevation
 *
 * Usage:
 * <Card>
 *   <Card.Image src="recipe.jpg" alt="Recipe" />
 *   <Card.Content>
 *     <h3>Recipe Title</h3>
 *     <p>Description</p>
 *   </Card.Content>
 *   <Card.Actions>
 *     <Button>Action</Button>
 *   </Card.Actions>
 * </Card>
 */

import './Card.css';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Image = ({ src, alt = '', objectFit = 'cover', ...props }) => {
  return (
    <div className="card-image">
      <img
        src={src}
        alt={alt}
        style={{ objectFit }}
        {...props}
      />
    </div>
  );
};

Card.Content = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Actions = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-actions ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
