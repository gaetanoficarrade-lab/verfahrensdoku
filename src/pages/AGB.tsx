import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import landingLogo from "@/assets/landing-logo.png";
import { useSEO } from "@/hooks/useSEO";

export default function AGB() {
  useSEO({
    title: "Allgemeine Geschäftsbedingungen | GoBD-Suite",
    robots: "noindex, nofollow",
  });

  const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
  const P = ({ children }: { children: React.ReactNode }) => <p className="mb-2">{children}</p>;
  const Indent = ({ children }: { children: React.ReactNode }) => <p className="mb-2 pl-4">{children}</p>;
  const List = ({ items }: { items: string[] }) => (
    <ul className="list-disc pl-8 mb-2 space-y-1">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] antialiased">
      <nav className="border-b border-[#e5e5e5]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <img src={landingLogo} alt="gobdsuite" className="h-10 object-contain" />
          </Link>
          <Link to="/" className="text-sm text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-sm text-[#86868b] mb-12">GoBD-Suite – Stand: März 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed text-[#1d1d1f]">
          <S title="§ 1 Geltungsbereich und Vertragsparteien">
            <P>
              1.1 Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über die Nutzung der SaaS-Plattform
              GoBD-Suite, die zwischen
            </P>
            <Indent>Gaetano Ficarra | gaetanoficarra.de | Bielefeld | E-Mail: kontakt@gaetanoficarra.de</Indent>
            <P>(nachfolgend „Anbieter") und dem jeweiligen Kunden (nachfolgend „Kunde") geschlossen werden.</P>
            <P>
              1.2 Der Dienst richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB, d.&nbsp;h. natürliche
              oder juristische Personen sowie rechtsfähige Personengesellschaften, die bei Abschluss des Vertrages in
              Ausübung ihrer gewerblichen oder selbständigen beruflichen Tätigkeit handeln.
            </P>
            <P>
              1.3 Entgegenstehende oder von diesen AGB abweichende Bedingungen des Kunden werden nicht anerkannt, es sei
              denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </P>
          </S>

          <S title="§ 2 Leistungsbeschreibung">
            <P>
              2.1 GoBD-Suite stellt Unternehmern eine cloudbasierte SaaS-Plattform zur Verfügung, die folgende
              Kernfunktionen umfasst:
            </P>
            <List
              items={[
                "Erstellung und Verwaltung GoBD-konformer Verfahrensdokumentationen",
                "KI-gestützte Textgenerierung und Prüfung von Kapiteln",
                "Versionierung und revisionssichere Archivierung von Dokumenten",
                "PDF-Export der fertigen Verfahrensdokumentation",
                "Kundenverwaltung für Berater und Agenturen (je nach gebuchtem Plan)",
              ]}
            />
            <P>
              2.2 Der Anbieter stellt den Dienst als Software-as-a-Service über das Internet bereit. Der Kunde erhält
              kein Recht auf Herausgabe des Quellcodes.
            </P>
            <P>
              2.3 Die über GoBD-Suite erstellten Verfahrensdokumentationen dienen als Arbeitsgrundlage und technische
              Unterstützung. Die inhaltliche Richtigkeit der Dokumentation hängt ausschließlich von den Angaben des
              Kunden ab. Der Anbieter übernimmt keine Gewähr dafür, dass die erstellten Dokumente im Einzelfall den
              steuerrechtlichen Anforderungen der Finanzbehörden entsprechen oder bei einer Betriebsprüfung anerkannt
              werden. Die Nutzung des Dienstes ersetzt keine steuerliche oder rechtliche Beratung.
            </P>
            <P>
              2.4 Der Anbieter ist berechtigt, den Leistungsumfang angemessen zu erweitern, zu ändern oder
              einzuschränken, sofern dies dem Kunden mindestens 30 Tage vor Inkrafttreten in Textform mitgeteilt wird
              und die Änderung für den Kunden zumutbar ist.
            </P>
            <P>
              2.5 Geplante Wartungsarbeiten werden dem Kunden nach Möglichkeit vorab angekündigt. Der Anbieter strebt
              eine Verfügbarkeit von 99 % im Jahresmittel an, ausgenommen geplante Wartungsfenster und von Dritten
              verursachte Ausfälle.
            </P>
          </S>

          <S title="§ 3 Vertragsschluss und Nutzungskonto">
            <P>
              3.1 Der Vertrag kommt durch Registrierung auf der Plattform und die Freischaltung des Zugangs durch den
              Anbieter zustande.
            </P>
            <P>
              3.2 Der Kunde ist verpflichtet, bei der Registrierung vollständige und wahrheitsgemäße Angaben zu machen
              und diese stets aktuell zu halten.
            </P>
            <P>
              3.3 Zugangsdaten sind vertraulich zu behandeln und dürfen nicht an Dritte weitergegeben werden. Der Kunde
              haftet für alle Handlungen, die unter seinem Konto vorgenommen werden, sofern er die unbefugte Nutzung
              nicht zu vertreten hat.
            </P>
            <P>3.4 Jede unbefugte Nutzung des Kontos ist dem Anbieter unverzüglich zu melden.</P>
          </S>

          <S title="§ 4 Nutzungsrechte und Planumfang">
            <P>
              4.1 Der Anbieter räumt dem Kunden für die Vertragslaufzeit ein nicht ausschließliches, nicht übertragbares
              Recht ein, den Dienst im Rahmen dieser AGB zu nutzen.
            </P>
            <P>4.2 Der Umfang der Nutzung richtet sich nach dem gebuchten Plan:</P>
            <List
              items={[
                "Plan Solo: Nutzung für einen Kunden, kein Whitelabel",
                "Plan Berater: Nutzung für bis zu fünf Kunden, kein Whitelabel",
                "Plan Agentur: Nutzung für unbegrenzte Kunden, Whitelabel inklusive",
              ]}
            />
            <P>
              4.3 Der Kunde darf den Dienst nicht an Dritte weiterverkaufen, vermieten oder in sonstiger Weise
              weiterübertragen, soweit dies nicht ausdrücklich durch den gebuchten Plan gestattet ist. Reverse
              Engineering, Dekompilierung oder die Nutzung für rechtswidrige Zwecke sind untersagt.
            </P>
          </S>

          <S title="§ 5 Vergütung und Zahlungsbedingungen">
            <P>
              5.1 Die Entgelte richten sich nach der zum Zeitpunkt des Vertragsschlusses geltenden Preisliste. Alle
              Preise verstehen sich als Nettobeträge zuzüglich der gesetzlich geltenden Umsatzsteuer.
            </P>
            <P>
              5.2 Plan Solo wird als Einmalbetrag in Rechnung gestellt und gewährt einen Zugang für 12 Monate. Plan
              Berater und Plan Agentur werden je nach Wahl des Kunden bei Vertragsschluss monatlich oder jährlich im
              Voraus abgerechnet. Alle Preise verstehen sich als Nettobeträge zuzüglich der gesetzlich geltenden
              Umsatzsteuer.
            </P>
            <P>
              5.3 Zahlungen sind innerhalb von 14 Tagen nach Rechnungsstellung fällig. Bei Zahlungsverzug ist der
              Anbieter berechtigt, Verzugszinsen in Höhe von 9 Prozentpunkten über dem Basiszinssatz gemäß § 288 Abs. 2
              BGB zu berechnen.
            </P>
            <P>
              5.4 Der Anbieter behält sich vor, die Preise mit einer Ankündigungsfrist von mindestens 4 Wochen zum Ende
              des jeweiligen Abrechnungszeitraums anzupassen. Widerspricht der Kunde der Anpassung nicht innerhalb von 2
              Wochen nach Zugang der Ankündigung, gilt die Anpassung als angenommen.
            </P>
            <P>
              5.5 Der Anbieter ist berechtigt, den Zugang zum Dienst zu sperren, sofern Zahlungen trotz Mahnung nicht
              beglichen werden.
            </P>
          </S>

          <S title="§ 6 Testmodus">
            <P>
              6.1 Der Anbieter stellt auf Wunsch einen kostenlosen Testzugang für 7 Tage zur Verfügung. Der Testzugang
              ist auf einen Mustermandanten beschränkt, erlaubt die Bearbeitung von maximal zwei Kapiteln und erzeugt
              PDF-Exporte mit dem Wasserzeichen „MUSTER-VERFAHRENSDOKUMENTATION".
            </P>
            <P>
              6.2 Nach Ablauf des Testzeitraums wird der Zugang automatisch gesperrt. Eine Verlängerung des
              Testzeitraums liegt im Ermessen des Anbieters.
            </P>
            <P>
              6.3 Ein Anspruch auf Übernahme der im Testzugang erstellten Daten in einen kostenpflichtigen Plan besteht
              nicht.
            </P>
          </S>

          <S title="§ 7 Pflichten des Kunden">
            <P>
              7.1 Der Kunde ist verantwortlich dafür, dass alle von ihm über den Dienst verarbeiteten Daten und Inhalte
              den geltenden Gesetzen entsprechen.
            </P>
            <P>
              7.2 Der Kunde hat den Dienst nicht zu missbrauchen. Untersagt sind insbesondere die Übertragung
              schädlicher Inhalte, der Aufbau übermäßiger Last sowie der Versuch, unbefugt auf Systeme oder Daten
              anderer Kunden zuzugreifen.
            </P>
            <P>
              7.3 Der Kunde ist allein verantwortlich für die steuerrechtliche Richtigkeit und Vollständigkeit der
              erstellten Verfahrensdokumentationen. Die durch GoBD-Suite generierten Texte sind auf Basis der
              Kundenangaben erstellt und stellen eine technische Arbeitshilfe dar. Der Kunde ist verpflichtet, alle
              generierten Inhalte vor Verwendung zu prüfen und gegebenenfalls anzupassen. GoBD-Suite ersetzt keine
              steuerliche oder rechtliche Beratung.
            </P>
          </S>

          <S title="§ 8 Datenschutz und Auftragsverarbeitung">
            <P>
              8.1 Soweit der Kunde personenbezogene Daten Dritter über den Dienst verarbeitet, agiert der Anbieter als
              Auftragsverarbeiter im Sinne des Art. 28 DSGVO. Die Parteien schließen zu diesem Zweck einen gesonderten
              Auftragsverarbeitungsvertrag ab.
            </P>
            <P>
              8.2 Der Anbieter verarbeitet personenbezogene Daten des Kunden zur Vertragserfüllung gemäß seiner
              Datenschutzerklärung, abrufbar unter gaetanoficarra.de/datenschutz.
            </P>
            <P>
              8.3 Der Anbieter trifft angemessene technische und organisatorische Maßnahmen zum Schutz der Daten gemäß
              Art. 32 DSGVO.
            </P>
          </S>

          <S title="§ 9 Einsatz von KI-Diensten">
            <P>
              9.1 Der Dienst nutzt KI-Modelle von OpenAI zur Textgenerierung und Prüfung von Kapitelinhalten. Die
              generierten Texte werden auf Grundlage der vom Kunden eingegebenen Informationen erstellt.
            </P>
            <P>
              9.2 Der Anbieter übernimmt keine Gewähr für die inhaltliche Vollständigkeit oder rechtliche Korrektheit
              der KI-generierten Texte. Der Kunde ist verpflichtet, die generierten Inhalte vor Verwendung zu prüfen.
            </P>
            <P>
              9.3 Eingaben des Kunden werden zur Verarbeitung an OpenAI übermittelt. Der Anbieter stellt sicher, dass
              diese Übermittlung den datenschutzrechtlichen Anforderungen entspricht.
            </P>
          </S>

          <S title="§ 10 Vertraulichkeit">
            <P>
              10.1 Beide Parteien verpflichten sich, alle im Rahmen des Vertragsverhältnisses erlangten vertraulichen
              Informationen der jeweils anderen Partei vertraulich zu behandeln und nicht an Dritte weiterzugeben.
            </P>
            <P>
              10.2 Die Pflicht zur Vertraulichkeit gilt nicht, soweit eine Offenlegung gesetzlich vorgeschrieben ist.
            </P>
          </S>

          <S title="§ 11 Gewährleistung und Mängelhaftung">
            <P>
              11.1 Der Anbieter stellt den Dienst in dem zur Vertragszeit üblichen Zustand zur Verfügung. Mängel werden
              innerhalb angemessener Frist beseitigt.
            </P>
            <P>
              11.2 Der Kunde hat Mängel unverzüglich in Textform zu melden. Ein Recht zur Minderung des Entgelts besteht
              nur, wenn die Verfügbarkeit des Dienstes den vereinbarten Mindestwert über einen zusammenhängenden
              Zeitraum von mehr als 24 Stunden unterschreitet.
            </P>
          </S>

          <S title="§ 12 Haftungsbeschränkung">
            <P>
              12.1 Der Anbieter haftet unbegrenzt für Schäden aus der Verletzung des Lebens, des Körpers oder der
              Gesundheit sowie für vorsätzlich oder grob fahrlässig verursachte Schäden.
            </P>
            <P>
              12.2 Bei einfacher Fahrlässigkeit haftet der Anbieter nur für die Verletzung wesentlicher
              Vertragspflichten. Die Haftung ist in diesem Fall auf den vertragstypisch vorhersehbaren Schaden begrenzt,
              maximal auf die Jahresvergütung des Kunden im betreffenden Vertragsjahr.
            </P>
            <P>
              12.3 Eine weitergehende Haftung, insbesondere für steuerrechtliche Folgen aus der Nutzung der erstellten
              Verfahrensdokumentationen, entgangenen Gewinn oder indirekte Schäden, ist ausgeschlossen.
            </P>
          </S>

          <S title="§ 13 Laufzeit und Kündigung">
            <P>
              13.1 Plan Solo läuft für 12 Monate ab Freischaltung. Eine Verlängerung erfolgt gegen eine jährliche
              Renewal-Gebühr von 199&nbsp;€ netto. Wird nicht verlängert, wird der Zugang nach Ablauf der 12 Monate
              gesperrt.
            </P>
            <P>
              13.2 Plan Berater und Plan Agentur unterliegen einer Mindestlaufzeit von 3 Monaten beim monatlichen
              Abrechnungsmodell. Nach Ablauf der Mindestlaufzeit können sie jederzeit zum Ende des laufenden
              Abrechnungsmonats ordentlich gekündigt werden. Beim jährlichen Abrechnungsmodell beträgt die
              Mindestlaufzeit 12 Monate. Nach Ablauf verlängert sich der Vertrag automatisch um ein weiteres Jahr,
              sofern er nicht mit einer Frist von 30 Tagen vor Ablauf in Textform gekündigt wird. Ein Wechsel vom
              monatlichen zum jährlichen Abrechnungsmodell ist jederzeit möglich und wird zum nächsten
              Abrechnungszeitraum wirksam. Ein Wechsel vom jährlichen zum monatlichen Abrechnungsmodell ist zum Ende der
              laufenden Jahresperiode möglich.
            </P>
            <P>13.3 Dem Anbieter steht eine ordentliche Kündigung mit einer Frist von 30 Tagen zum Monatsende zu.</P>
            <P>
              13.4 Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund
              liegt insbesondere vor bei anhaltendem Zahlungsverzug, wesentlichen Vertragspflichtverletzungen oder
              Eröffnung eines Insolvenzverfahrens über das Vermögen des Kunden.
            </P>
            <P>13.5 Kündigungen bedürfen der Textform, E-Mail ist ausreichend.</P>
          </S>

          <S title="§ 14 Folgen der Vertragsbeendigung">
            <P>14.1 Nach Beendigung des Vertrages kann der Kunde seine Daten innerhalb von 30 Tagen exportieren.</P>
            <P>
              14.2 Nach Ablauf der Exportfrist ist der Anbieter berechtigt, alle Kundendaten endgültig zu löschen,
              soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </P>
            <P>
              14.3 Bereits erbrachte und abgerechnete Leistungen sind nicht erstattungsfähig, es sei denn, der Anbieter
              hat die Kündigung aus wichtigem Grund zu vertreten.
            </P>
          </S>

          <S title="§ 15 Zufriedenheitsgarantie">
            <P>
              15.1 Der Anbieter bietet eine Zufriedenheitsgarantie für den Fall, dass das Tool technische Mängel
              aufweist, nicht die beschriebenen Funktionen erfüllt oder so komplex ist, dass eine sinnvolle Nutzung
              nicht möglich ist und der Anbieter das Problem nicht beheben kann.
            </P>
            <P>
              15.2 In diesen Fällen kann der Kunde innerhalb von 30 Tagen nach Vertragsschluss eine Rückerstattung des
              gezahlten Entgelts verlangen, sofern die Mindestlaufzeit von 3 Monaten noch nicht abgelaufen ist. Die
              Rückerstattung erfolgt nach Prüfung des gemeldeten Problems durch den Anbieter. Bei jährlichen Plänen wird
              der anteilige Restbetrag erstattet.
            </P>
            <P>
              15.3 Die Garantie gilt ausdrücklich nicht wenn der Kunde das Tool bestimmungsgemäß genutzt und bereits
              eine oder mehrere vollständige Verfahrensdokumentationen erstellt hat, da die vertraglich geschuldete
              Leistung in diesem Fall vollständig erbracht wurde. Ebenso besteht kein Anspruch auf Rückerstattung nach
              Ablauf der 3-monatigen Mindestlaufzeit beim monatlichen Modell oder nach Ablauf von 3 Monaten beim
              Jahresmodell.
            </P>
            <P>
              15.4 Zur Geltendmachung der Garantie ist eine schriftliche Schilderung des Problems per E-Mail an
              kontakt@gaetanoficarra.de erforderlich.
            </P>
          </S>

          <S title="§ 16 Änderungen der AGB">
            <P>
              16.1 Der Anbieter ist berechtigt, diese AGB mit einer Ankündigungsfrist von mindestens 4 Wochen zu ändern.
              Die Änderungen werden dem Kunden per E-Mail mitgeteilt.
            </P>
            <P>
              16.2 Widerspricht der Kunde den Änderungen nicht innerhalb von 2 Wochen nach Zugang der Ankündigung,
              gelten die geänderten AGB als angenommen. Auf diese Rechtsfolge wird in der Ankündigung gesondert
              hingewiesen.
            </P>
          </S>

          <S title="§ 17 Schlussbestimmungen">
            <P>17.1 Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</P>
            <P>
              17.2 Erfüllungsort und ausschließlicher Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich
              zulässig, Bielefeld.
            </P>
            <P>
              17.3 Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der
              übrigen Bestimmungen unberührt.
            </P>
            <p>17.4 Mündliche Nebenabreden bestehen nicht. Änderungen bedürfen der Textform.</p>
          </S>
        </div>
      </main>
    </div>
  );
}
