"use client";

import { Ordem } from "@/lib/api";

export function OrdemDocumento({ ordem }: { ordem: Ordem }) {
  const reboques = [ordem.veiculo?.reboque1, ordem.veiculo?.reboque2, ordem.veiculo?.reboque3]
    .filter(Boolean).join(" / ");

  return (
    <div id="ordem-print" style={{
      backgroundColor: "#ffffff", color: "#000000", fontFamily: "Arial, sans-serif",
      width: "100%", maxWidth: 720, margin: "0 auto", boxSizing: "border-box",
      border: "2px solid #000000", padding: 15,
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "none", marginBottom: 15, backgroundColor: "#ffffff" }}>
        <tbody>
          <tr>
            <td style={{ width: "40%", textAlign: "left", padding: 0, border: "none", verticalAlign: "top" }}>
              <div style={{ fontSize: 65, fontWeight: 900, fontStyle: "italic", color: "#5a2a2a", letterSpacing: -4, lineHeight: 0.8, marginTop: 5 }}>
                G10
                <span style={{ fontSize: 12, backgroundColor: "#5a2a2a", color: "#ffffff", padding: "3px 6px", fontStyle: "normal", fontWeight: "bold", verticalAlign: "middle", position: "relative", top: -15, marginLeft: -5, letterSpacing: 0 }}>
                  TRANSPORTES
                </span>
              </div>
            </td>
            <td style={{ width: "60%", fontSize: 11, fontWeight: "bold", textAlign: "left", padding: 0, border: "none", lineHeight: 1.3, color: "#000000" }}>
              G10 - TRANSPORTES LTDA<br />
              BR 392 KM 10 SALA 17, 1<br />
              BARRA, RIO GRANDE - RS<br />
              FONE: (53) 3230-3713<br />
              RIO GRANDE<br />
              CNPJ: 07.569.161/0012-00 | IE: 1000298180
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: "center", margin: "15px 0", borderTop: "1px solid #000000", borderBottom: "1px solid #000000", padding: 6 }}>
        <span style={{ fontSize: 15, fontWeight: "bold" }}>AUTORIZAÇÃO DE CARREGAMENTO</span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 10, border: "1px solid #000000", backgroundColor: "#ffffff" }}>
        <tbody>
          <tr>
            <td style={cellStyle}><strong>REMETENTE:</strong> {ordem.carga.cliente?.razaoSocial || ""}</td>
            <td style={cellStyle}><strong>LOCAL:</strong> {ordem.carga.origemCidade}</td>
          </tr>
          <tr>
            <td style={cellStyle}><strong>DESTINATÁRIO:</strong> {ordem.carga.clienteDestino?.razaoSocial || ""}</td>
            <td style={cellStyle}><strong>LOCAL:</strong> {ordem.carga.destinoCidade}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ backgroundColor: "#000000", color: "#ffffff", textAlign: "center", fontWeight: "bold", padding: 6, fontSize: 11, marginBottom: 10, border: "1px solid #000000" }}>
        AUTORIZAMOS O CARREGAMENTO DO SEGUINTE VEÍCULO
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 10, border: "1px solid #000000", backgroundColor: "#ffffff" }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, width: "40%" }}><strong>CAVALO:</strong> {ordem.veiculo?.placa || ""}</td>
            <td style={{ ...cellStyle, width: "60%" }} colSpan={2}><strong>S.REB.:</strong> {reboques}</td>
          </tr>
          <tr>
            <td style={cellStyle} colSpan={2}><strong>PROPRIETÁRIO:</strong> {ordem.veiculo?.proprietarioNome || ""}</td>
            <td style={cellStyle}><strong>CPF/CNPJ:</strong> {ordem.veiculo?.proprietarioCpfCnpj || ""}</td>
          </tr>
          <tr>
            <td style={cellStyle} colSpan={2}><strong>ENDEREÇO:</strong> {ordem.veiculo?.proprietarioEndereco || ""}</td>
            <td style={cellStyle}><strong>MUNICÍPIO:</strong> {ordem.veiculo?.proprietarioMunicipioUf || ""}</td>
          </tr>
          <tr>
            <td style={cellStyle} colSpan={3}><strong>MOTORISTA:</strong> {ordem.motorista.nome}</td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, width: "33%" }}><strong>CART. HAB. Nº:</strong> {ordem.motorista.cnh || ""}</td>
            <td style={{ ...cellStyle, width: "33%" }}><strong>RG:</strong> {ordem.motorista.rg || ""}</td>
            <td style={{ ...cellStyle, width: "34%" }}><strong>CPF:</strong> {ordem.motorista.cpf || ""}</td>
          </tr>
          <tr>
            <td style={cellStyle} colSpan={3}><strong>TELEFONE:</strong> {ordem.motorista.telefone || ""}</td>
          </tr>
          <tr>
            <td style={cellStyle} colSpan={3}><strong>OBSERVAÇÃO:</strong> {ordem.observacao || ""}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, border: "1px solid #000000", backgroundColor: "#ffffff", textAlign: "center" }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, fontWeight: "bold" }} colSpan={3}>DADOS DO CARREGAMENTO</td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, fontWeight: "bold", width: "33%" }}>PEDIDO</td>
            <td style={{ ...cellStyle, fontWeight: "bold", width: "34%" }}>PRODUTO</td>
            <td style={{ ...cellStyle, fontWeight: "bold", width: "33%" }}>FRETE MOTORISTA</td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, padding: 12 }}>{ordem.peso || ""} TONS</td>
            <td style={{ ...cellStyle, padding: 12 }}>{ordem.carga.produto}</td>
            <td style={{ ...cellStyle, padding: 12 }}>R$ {ordem.freteMotorista ? Number(ordem.freteMotorista).toFixed(2).replace(".", ",") : "0,00"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const cellStyle: React.CSSProperties = { border: "1px solid #000000", padding: 6, color: "#000000" };
