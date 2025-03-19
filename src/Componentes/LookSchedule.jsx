import React, { useState, useEffect } from "react";
import Spinner from "../Componentes/Spinner";
import Swal from "sweetalert2";
import NavBar from "../Componentes/NavBar";
import Modal from "react-modal";

const ShowSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedDni, setSelectedDni] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [newState, setNewState] = useState("");
  const estados = ["disponible", "confirmado", "cancelado", "eliminado", "ejecutado", "no_asistido", "no_reservado"];
  
  

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("http://localhost:3000/schedules");
        if (!response.ok) {
          throw new Error(`Error al obtener los turnos: ${response.status}`);
        }
        const result = await response.json();
        console.log("Turnos obtenidos:", result);

        // Ordenar los turnos por día
        const sortedSchedules = result.data.sort(
          (a, b) => new Date(a.Dia) - new Date(b.Dia)
        );
        setSchedules(sortedSchedules);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        Swal.fire({ text: "Hubo un error al traer los turnos", icon: "error" });
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:3000/doctors");
        if (!response.ok) {
          throw new Error(`Error al obtener los doctores: ${response.status}`);
        }
        const result = await response.json();
        setDoctors(result.data);
      } catch (error) {
        Swal.fire({
          text: "Hubo un error al traer los doctores",
          icon: "error",
        });
      }
    };

    fetchSchedules();
    fetchDoctors();
  }, []);

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const handleStateChange = (event) => {
    setSelectedState(event.target.value.toLowerCase());
  };

  const handleDniChange = (event) => {
    setSelectedDni(event.target.value);
  };

  const handleChangeEstado = async (idSchedule, newState, additionalData = {}) => {
    console.log("ID del turno:", idSchedule);
    try {
      const body = {
        estado: newState,
        ...additionalData, // Incluir idPatient o deletionReason si aplican
      };

      const response = await fetch(`http://localhost:3000/schedules/${idSchedule}/change-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error al cambiar el estado: ${response.status}`);
      }

      const updatedSchedule = await response.json();

      setSchedules((prevSchedules) =>
        prevSchedules.map((schedule) =>
          schedule.idSchedule === idSchedule ? { ...schedule, estado: newState } : schedule
        )
      );

      Swal.fire({
        text: "Estado actualizado correctamente",
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        text: "Error al actualizar el estado",
        icon: "error",
      });
    }
  };
  
  const openModal = (schedule) => {
    setCurrentSchedule(schedule);
    setNewState("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentSchedule(null);
  };


  const filteredSchedules = schedules.filter((schedule) => {
    if (selectedDoctor && schedule.Doctor !== selectedDoctor) return false;
    if (selectedDay && schedule.Dia !== selectedDay) return false;
    if (selectedState && schedule.Estado !== selectedState) return false;
    if (selectedDni && schedule.Documento !== selectedDni) return false;
    return true;
  });


  return (
    <>
      <NavBar showLinks={true} />
      <div className="barra-superior">
        <h2 className="titulo-section">Lista de turnos</h2>
      </div>
      <Spinner loading={loading} />
      {!loading && (
        <div>
          <div className="search-bar">
            <label className="search" htmlFor="selectDoctor">
              Doctor:
            </label>
            <select
              id="selectDoctor"
              value={selectedDoctor}
              onChange={handleDoctorChange}
            >
              <option value="">Todos</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.fullName}>
                  {doctor.fullName}
                </option>
              ))}
            </select>

            <label className="search" htmlFor="selectDay">
              Día:
            </label>
            <input
              type="date"
              id="selectDay"
              value={selectedDay}
              onChange={handleDayChange}
            />

            <label className="search" htmlFor="selectState">
              Estado:
            </label>
            <select
              id="selectState"
              value={selectedState}
              onChange={handleStateChange}
            >
              <option value="">Todos</option>
              <option value="disponible">disponible</option>
              <option value="confirmado">confirmado</option>
              <option value="cancelado">cancelado</option>
              <option value="ejecutado">ejecutado</option>
              <option value="no_asistido">no asistido</option>
              <option value="no_reservado">no reservado</option>
              <option value="eliminado">eliminado</option>
            </select>

            <label className="search" htmlFor="text"></label>
            <input
              type="text"
              id="text"
              value={selectedDni}
              onChange={handleDniChange}
              placeholder="Buscar por DNI"
            />
          </div>

          {filteredSchedules.length > 0 ? (
            <div className="tableContainer">
              <table className="Table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Día</th>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Informacion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.Doctor || "N/A"}</td>
                      <td>{schedule.Dia || "N/A"}</td>
                      <td>{schedule.Hora || "N/A"}</td>
                      <td>{schedule.Paciente || "N/A"}</td>
                      <td>{schedule.Telefono || "N/A"}</td>
                      <td>{schedule.Estado || "N/A"}</td>
                      <td>
                      <select
                    value={schedule.Estado}
                    onChange={e => handleChangeEstado(schedule.idSchedule, e.target.value)}
                  >
                    {estados.map(estado => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="tableContainer">
              <p>No hay información para los filtros seleccionados.</p>
            </div>
          )}
        </div>
      )}
      

    </>
  );
};
export default ShowSchedules;
