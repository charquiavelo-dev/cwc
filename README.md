# CWC — Charlie Weed Crew / Vinyl Player

Proyecto web hecho con **Vite + HTML + TypeScript + CSS + Phaser**. No usa BAT, PowerShell, React ni servidor custom.

## Ejecutar

```bash
npm install
npm run dev
```

Vite abre el sitio en `http://localhost:5173`.

## Audio

El ZIP incluye `source-audio/CWeeD.rar`. El plugin de Vite en `vite.config.ts` usa `node-unrar-js` para extraer automáticamente los MP3 a `public/audio` la primera vez que ejecutás `npm run dev` o `npm run build`. No hay scripts `.bat` ni `.ps1`.

Si preferís no conservar el RAR, podés dejar los MP3 directamente en `public/audio/` con sus nombres originales y borrar `source-audio/`.

## Controles

- Click en el botón principal: play / pause.
- Flechas del deck: anterior / siguiente.
- Click en cualquier track: cambio de disco animado.
- Barra inferior: seek y volumen.
- Teclado: `Espacio` play/pause, `←` anterior, `→` siguiente.

## Tres pasadas visuales aplicadas

1. **Dirección artística:** boom bap 90s, flyer fotocopiado, metal oscuro, tipografía condensada y acentos ácidos/óxido.
2. **Tornamesa:** vinilo con grooves y reflejos, label dinámico, plato, tonearm articulado, cambio de pista con lift/drop, spin, desaceleración y VU meters.
3. **Pulido:** capa Phaser con polvo/sparks/scanner, microinteracciones, responsive, estados active/playing, textura de grano y accesibilidad para reduced motion.
