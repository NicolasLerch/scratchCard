import "./FormPage.css";
// import whiteLogo from "../assets/supervielle-logo-white.png";
import { supabase } from "../supaBaseClient";
import { useState, useEffect } from "react";

import Swal from "sweetalert2";

// import supervielleMineriaPurple from "../assets/sup-mineria-logo-purple.png";
// import supervielleMineriaWhite from "../assets/sup-mineria-logo-white.png";
// import supervielleMineriaRed from "../assets/sup-mineria-logo-red.png";
import supervielleMineria from "../assets/sup-mineria-logo.png";

export default function FormPage() {
  const [prizesAvailables, setPrizesAvailables] = useState(true);

  const mailExists = async (email) =>{
    const { data: Clients, error } = await supabase.from("Clients").select("email").eq("email", email);
    if (error) {
      console.log(error);
      console.log(Clients)
    } else {
      if (Clients.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.email = data.email.trim().toLowerCase();

    //Validaciones
    const mail = formData.get("email").trim().toLowerCase();
    const exists = await mailExists(mail);
    if (exists) {
      Swal.fire({
        icon: "error",
        title: "Correo ya registrado",
        text: "El correo ya se encuentra registrado en nuestra base de datos.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const phone = formData.get("phone");
    if (!/^\d{7,15}$/.test(phone)) {
      Swal.fire({
        icon: "error",
        title: "Número inválido",
        text: "El teléfono debe contener solo números (entre 7 y 15 dígitos)",
      });
      return;
    }

    // Enviarlo a Supabase
    const { error } = await supabase.from("Clients").insert([
      {
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
      },
    ]);

    if (error) {
      console.error("Error al guardar:", error);
      Swal.fire({
        icon: "error",
        title: "Lo sentimos",
        text: "Hubo un error al guardar los datos. Intentá de nuevo.",
        confirmButtonText: "Aceptar",
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Datos guardados",
        confirmButtonText: "Continuar",
      }).then(() => {
        window.location.href = "/game";
      });
    }
  };

  const checkIfPrizesAvailables = async () => {
    let { data: Prizes, error } = await supabase.from("Prizes").select("stock");
    if (error) {
      console.log(error);
    } else {
      if (Prizes[0].stock === 0) {
        setPrizesAvailables(false);
      }
    }
  };

  useEffect(() => {
    checkIfPrizesAvailables();
    if (prizesAvailables === false) {
      Swal.fire({
        icon: "error",
        title: "Lo sentimos",
        text: "No hay más premios disponibles",
        confirmButtonText: "Aceptar",
      });
    }
  }, [prizesAvailables]);

  return (
    <div className="FormPage">
      <div className="title-container">
        <img
          className="supervielle-logo-img"
          src={supervielleMineria}
          alt="Supervielle Logo"
        />
        <div className="title-text-container">
          <p className="title-text">TE SIGUE EL RITMO</p>
        </div>
      </div>
      <div className="form-container">
        <form className="home-form" id="home-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Nombre" name="name" required />
          <input type="text" placeholder="Apellido" name="last_name" required />
          <input type="email" placeholder="Email" name="email" required />
          <input type="tel" placeholder="Celular" name="phone" required />
          <button className="submit-button" type="submit">
            Jugar
          </button>
        </form>
      </div>
    </div>
  );
}
