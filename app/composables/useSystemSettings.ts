export const useSystemSettings = () => {
  return useFetch('/api/settings/public', {
    key: 'system-settings',
    lazy: true
  });
};
