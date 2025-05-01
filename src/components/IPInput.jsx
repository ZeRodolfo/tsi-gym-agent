import React, { useState } from 'react';
import InputMask from 'react-input-mask';

export default function IPInput({value, onChange}) {
  return (
    <InputMask
      mask="999.999.999.999"
      value={value}
      onChange={onChange}
      placeholder="Digite o IP"
    />
  );
}
