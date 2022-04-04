function hideById() {
  for (let i = 0; i < arguments.length; i++) {
    $(`#${arguments[i]}`).attr('hidden', 'true');
  }
}