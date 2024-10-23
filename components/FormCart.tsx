import React from "react";
import { useCart } from "../contexts/CartContext";

interface FormCartProps {
  formId: string;
}

const FormCart: React.FC<FormCartProps> = ({ formId }) => {
  const { getCartItemsByFormId, removeFromCart } = useCart();
  const cartItems = getCartItemsByFormId(formId);

  return (
    <div>
      <h2>Selected Plans for This Offer</h2>
      {cartItems.length === 0 ? (
        <p>No plans selected for this offer yet.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id}>
              {item.name} - ${item.price}
              <button onClick={() => removeFromCart(item.id, formId)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormCart;
