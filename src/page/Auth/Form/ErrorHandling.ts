export const ErrorHandling = (error: string) => {
  switch (error) {
    case "You must provide either an email or phone number and a password":
      return "Você precisa colocar tanto um email quanto uma senha.";
    case "Invalid login credentials":
      return "Usuario ou senha inválidos";
  }
};
