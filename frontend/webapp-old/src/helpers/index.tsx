export const formatAddress = (address: string, maxLength = 3) => {
  if (!address) {
    return '0x????...????';
  }

  return (
    address.slice(0, maxLength + 2) +
    '...' +
    address.slice(address.length - maxLength - 1, address.length)
  );
};
