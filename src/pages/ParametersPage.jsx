import { useNavigate } from "react-router-dom";
import AccessControlConfig from "components/AccessControlConfig";
import { RevalidateTokenProvider } from "contexts/RevalidateToken";
import { Card } from "components/ui/Card";

const ParametersPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-3 grid grid-cols-[180px_1fr] gap-2 justify-center items-center w-full">
      <div>
        <img
          src="/logo.png"
          alt="Logo da TSI Gym"
          className="w-[180px] h-[180px] rounded-full"
        />
      </div>
      <Card className="p-3 mt-5 flex flex-col justify-center gap-2">
        <div >
          <AccessControlConfig onSetup={() => navigate("/main")} />
        </div>
      </Card>
    </div>
  );
};

export default ParametersPage;
