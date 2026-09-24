CREATE DATABASE IF NOT EXISTS veterinaria;
USE veterinaria;

CREATE TABLE IF NOT EXISTS mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    edad INT NOT NULL,
    peso DECIMAL(5,2) NOT NULL
);

INSERT INTO mascotas (nombre, especie, edad, peso) VALUES
('Max', 'Perro', 5, 18.50),
('Luna', 'Gato', 3, 4.20),
('Rocky', 'Perro', 2, 12.00);
