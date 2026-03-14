import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import landingLogo from '@/assets/landing-logo.png';

export default function AGB() {
  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] antialiased">
      <nav className="border-b border-[#e5e5e5]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/landing">
            <img src={landingLogo} alt="gobdsuite" className="h-10 object-contain" />
          </Link>
          <Link to="/landing" className="text-sm text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-sm text-[#86868b] mb-12">GoBD-Suite – Stand: März 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed text-[#1d1d1f]">
          <section>
            <h2 className="text-xl font-semibold mb-3">§ 1 Geltungsbereich und Vertragsparteien</h2>
            <p className="mb-2">
              1.1 Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über die Nutzung der SaaS-Plattform GoBD-Suite, die zwischen
            </p>
            <p className="mb-2 pl-4">
              Gaetano Ficarra | gaetanoficarra.de | Bielefeld | E-Mail: kontakt@gaetanoficarra.de
            </p>
            <p className="mb-2">
              (nachfolgend „Anbieter") und dem jeweiligen Kunden (nachfolgend „Kunde") geschlossen werden.
            </p>
            <p className="mb-2">
              1.2 Der Dienst richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB, d.&nbsp;h. natürliche oder juristische Personen sowie rechtsfähige Personengesellschaften, die bei Abschluss des Vertrages in Ausübung ihrer gewerblichen oder selbständigen beruflichen Tätigkeit handeln.
            </p>
            <p>
              1.3 Entgegenstehende oder von diesen AGB abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 2 Leistungsbeschreibung</h2>
            <p className="mb-2">
              2.1 GoBD-Suite stellt Unternehmern eine cloudbasierte SaaS-Plattform zur Verfügung, die folgende Kernfunktionen umfasst:
            </p>
            <ul className="list-disc pl-6 mb-3 space-y-1">
              <li>Erstellung und Verwaltung GoBD-konformer Verfahrensdokumentationen</li>
              <li>KI-gestützte Textgenerierung und Prüfung von Kapiteln</li>
              <li>Versionierung und revisionssichere Archivierung von Dokumenten</li>
              <li>PDF-Export der fertigen Verfahrensdokumentation</li>
              <li>Mandantenverwaltung für Berater und Agenturen (je nach gebuchtem Plan)</li>
            </ul>
            <p className="mb-2">
              2.2 Der Anbieter stellt den Dienst als Software-as-a-Service über das Internet bereit. Der Kunde erhält kein Recht auf Herausgabe des Quellcodes.
            </p>
            <p className="mb-2">
              2.3 Die über GoBD-Suite erstellten Verfahrensdokumentationen dienen als Arbeitsgrundlage. Der Anbieter übernimmt keine Gewähr dafür, dass die erstellten Dokumente im Einzelfall den steuerrechtlichen Anforderungen der Finanzbehörden entsprechen. Die Nutzung des Dienstes ersetzt keine steuerliche oder rechtliche Beratung.
            </p>
            <p className="mb-2">
              2.4 Der Anbieter ist berechtigt, den Leistungsumfang angemessen zu erweitern, zu ändern oder einzuschränken, sofern dies dem Kunden mindestens 30 Tage vor Inkrafttreten in Textform mitgeteilt wird und die Änderung für den Kunden zumutbar ist.
            </p>
            <p>
              2.5 Geplante Wartungsarbeiten werden dem Kunden nach Möglichkeit vorab angekündigt. Der Anbieter strebt eine Verfügbarkeit von 99 % im Jahresmittel an, ausgenommen geplante Wartungsfenster und von Dritten verursachte Ausfälle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 3 Vertragsschluss und Nutzungskonto</h2>
            <p className="mb-2">3.1 Der Vertrag kommt durch Registrierung auf der Plattform und die Freischaltung des Zugangs durch den Anbieter zustande.</p>
            <p className="mb-2">3.2 Der Kunde ist verpflichtet, bei der Registrierung vollständige und wahrheitsgemäße Angaben zu machen und diese stets aktuell zu halten.</p>
            <p className="mb-2">3.3 Zugangsdaten sind vertraulich zu behandeln und dürfen nicht an Dritte weitergegeben werden. Der Kunde haftet für alle Handlungen, die unter seinem Konto vorgenommen werden, sofern er die unbefugte Nutzung nicht zu vertreten hat.</p>
            <p>3.4 Jede unbefugte Nutzung des Kontos ist dem Anbieter unverzüglich zu melden.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 4 Nutzungsrechte und Planumfang</h2>
            <p className="mb-2">4.1 Der Anbieter räumt dem Kunden für die Vertragslaufzeit ein nicht ausschließliches, nicht übertragbares Recht ein, den Dienst im Rahmen dieser AGB zu nutzen.</p>
            <p className="mb-2">4.2 Der Umfang der Nutzung richtet sich nach dem gebuchten Plan:</p>
            <ul className="list-disc pl-6 mb-3 space-y-1">
              <li><strong>Plan Solo:</strong> Nutzung für einen Mandanten, kein Whitelabel</li>
              <li><strong>Plan Berater:</strong> Nutzung für bis zu fünf Mandanten, kein Whitelabel</li>
              <li><strong>Plan Agentur:</strong> Nutzung für unbegrenzte Mandanten, Whitelabel inklusive</li>
            </ul>
            <p>4.3 Der Kunde darf den Dienst nicht an Dritte weiterverkaufen, vermieten oder in sonstiger Weise weiterübertragen, soweit dies nicht ausdrücklich durch den gebuchten Plan gestattet ist. Reverse Engineering, Dekompilierung oder die Nutzung für rechtswidrige Zwecke sind untersagt.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 5 Vergütung und Zahlungsbedingungen</h2>
            <p className="mb-2">5.1 Die Entgelte richten sich nach der zum Zeitpunkt des Vertragsschlusses geltenden Preisliste. Alle Preise verstehen sich als Nettobeträge zuzüglich der gesetzlich geltenden Umsatzsteuer.</p>
            <p className="mb-2">5.2 Plan Solo wird als Einmalbetrag in Rechnung gestellt. Wiederkehrende Pläne (Berater, Agentur) werden monatlich im Voraus abgerechnet. Setup-Gebühren sind einmalig fällig.</p>
            <p className="mb-2">5.3 Zahlungen sind innerhalb von 14 Tagen nach Rechnungsstellung fällig. Bei Zahlungsverzug ist der Anbieter berechtigt, Verzugszinsen in Höhe von 9 Prozentpunkten über dem Basiszinssatz gemäß § 288 Abs. 2 BGB zu berechnen.</p>
            <p className="mb-2">5.4 Der Anbieter behält sich vor, die Preise mit einer Ankündigungsfrist von mindestens 4 Wochen zum Ende des jeweiligen Abrechnungszeitraums anzupassen. Widerspricht der Kunde der Anpassung nicht innerhalb von 2 Wochen nach Zugang der Ankündigung, gilt die Anpassung als angenommen.</p>
            <p>5.5 Der Anbieter ist berechtigt, den Zugang zum Dienst zu sperren, sofern Zahlungen trotz Mahnung nicht beglichen werden.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 6 Testmodus</h2>
            <p className="mb-2">6.1 Der Anbieter stellt auf Wunsch einen kostenlosen Testzugang für 7 Tage zur Verfügung. Der Testzugang ist auf einen Mustermandanten beschränkt, erlaubt die Bearbeitung von maximal zwei Kapiteln und erzeugt PDF-Exporte mit dem Wasserzeichen „MUSTER-VERFAHRENSDOKUMENTATION".</p>
            <p className="mb-2">6.2 Nach Ablauf des Testzeitraums wird der Zugang automatisch gesperrt. Eine Verlängerung des Testzeitraums liegt im Ermessen des Anbieters.</p>
            <p>6.3 Ein Anspruch auf Übernahme der im Testzugang erstellten Daten in einen kostenpflichtigen Plan besteht nicht.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 7 Pflichten des Kunden</h2>
            <p className="mb-2">7.1 Der Kunde ist verantwortlich dafür, dass alle von ihm über den Dienst verarbeiteten Daten und Inhalte den geltenden Gesetzen entsprechen.</p>
            <p className="mb-2">7.2 Der Kunde hat den Dienst nicht zu missbrauchen. Untersagt sind insbesondere die Übertragung schädlicher Inhalte, der Aufbau übermäßiger Last sowie der Versuch, unbefugt auf Systeme oder Daten anderer Kunden zuzugreifen.</p>
            <p>7.3 Der Kunde ist allein verantwortlich für die steuerrechtliche Richtigkeit und Vollständigkeit der erstellten Verfahrensdokumentationen.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 8 Datenschutz und Auftragsverarbeitung</h2>
            <p className="mb-2">8.1 Soweit der Kunde personenbezogene Daten Dritter über den Dienst verarbeitet, agiert der Anbieter als Auftragsverarbeiter im Sinne des Art. 28 DSGVO. Die Parteien schließen zu diesem Zweck einen gesonderten Auftragsverarbeitungsvertrag ab.</p>
            <p className="mb-2">8.2 Der Anbieter verarbeitet personenbezogene Daten des Kunden zur Vertragserfüllung gemäß seiner Datenschutzerklärung, abrufbar unter gaetanoficarra.de/datenschutz.</p>
            <p>8.3 Der Anbieter trifft angemessene technische und organisatorische Maßnahmen zum Schutz der Daten gemäß Art. 32 DSGVO.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 9 Einsatz von KI-Diensten</h2>
            <p className="mb-2">9.1 Der Dienst nutzt KI-Modelle von OpenAI zur Textgenerierung und Prüfung von Kapitelinhalten. Die generierten Texte werden auf Grundlage der vom Kunden eingegebenen Informationen erstellt.</p>
            <p className="mb-2">9.2 Der Anbieter übernimmt keine Gewähr für die inhaltliche Vollständigkeit oder rechtliche Korrektheit der KI-generierten Texte. Der Kunde ist verpflichtet, die generierten Inhalte vor Verwendung zu prüfen.</p>
            <p>9.3 Eingaben des Kunden werden zur Verarbeitung an OpenAI übermittelt. Der Anbieter stellt sicher, dass diese Übermittlung den datenschutzrechtlichen Anforderungen entspricht.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 10 Vertraulichkeit</h2>
            <p className="mb-2">10.1 Beide Parteien verpflichten sich, alle im Rahmen des Vertragsverhältnisses erlangten vertraulichen Informationen der jeweils anderen Partei vertraulich zu behandeln und nicht an Dritte weiterzugeben.</p>
            <p>10.2 Die Pflicht zur Vertraulichkeit gilt nicht, soweit eine Offenlegung gesetzlich vorgeschrieben ist.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 11 Gewährleistung und Mängelhaftung</h2>
            <p className="mb-2">11.1 Der Anbieter stellt den Dienst in dem zur Vertragszeit üblichen Zustand zur Verfügung. Mängel werden innerhalb angemessener Frist beseitigt.</p>
            <p>11.2 Der Kunde hat Mängel unverzüglich in Textform zu melden. Ein Recht zur Minderung des Entgelts besteht nur, wenn die Verfügbarkeit des Dienstes den vereinbarten Mindestwert über einen zusammenhängenden Zeitraum von mehr als 24 Stunden unterschreitet.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 12 Haftungsbeschränkung</h2>
            <p className="mb-2">12.1 Der Anbieter haftet unbegrenzt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für vorsätzlich oder grob fahrlässig verursachte Schäden.</p>
            <p className="mb-2">12.2 Bei einfacher Fahrlässigkeit haftet der Anbieter nur für die Verletzung wesentlicher Vertragspflichten. Die Haftung ist in diesem Fall auf den vertragstypisch vorhersehbaren Schaden begrenzt, maximal auf die Jahresvergütung des Kunden im betreffenden Vertragsjahr.</p>
            <p>12.3 Eine weitergehende Haftung, insbesondere für steuerrechtliche Folgen aus der Nutzung der erstellten Verfahrensdokumentationen, entgangenen Gewinn oder indirekte Schäden, ist ausgeschlossen.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 13 Laufzeit und Kündigung</h2>
            <p className="mb-2">13.1 Plan Solo läuft für 12 Monate ab Freischaltung. Eine Verlängerung erfolgt gegen eine jährliche Renewal-Gebühr.</p>
            <p className="mb-2">13.2 Plan Berater und Plan Agentur laufen auf unbestimmte Zeit und können vom Kunden jederzeit zum Ende des laufenden Abrechnungsmonats ordentlich gekündigt werden.</p>
            <p className="mb-2">13.3 Dem Anbieter steht eine ordentliche Kündigung mit einer Frist von 30 Tagen zum Monatsende zu.</p>
            <p className="mb-2">13.4 Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt insbesondere vor bei anhaltendem Zahlungsverzug, wesentlichen Vertragspflichtverletzungen oder Eröffnung eines Insolvenzverfahrens über das Vermögen des Kunden.</p>
            <p>13.5 Kündigungen bedürfen der Textform, E-Mail ist ausreichend.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 14 Folgen der Vertragsbeendigung</h2>
            <p className="mb-2">14.1 Nach Beendigung des Vertrages kann der Kunde seine Daten innerhalb von 30 Tagen exportieren.</p>
            <p className="mb-2">14.2 Nach Ablauf der Exportfrist ist der Anbieter berechtigt, alle Kundendaten endgültig zu löschen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
            <p>14.3 Bereits erbrachte und abgerechnete Leistungen sind nicht erstattungsfähig, es sei denn, der Anbieter hat die Kündigung aus wichtigem Grund zu vertreten.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 15 Änderungen der AGB</h2>
            <p className="mb-2">15.1 Der Anbieter ist berechtigt, diese AGB mit einer Ankündigungsfrist von mindestens 4 Wochen zu ändern. Die Änderungen werden dem Kunden per E-Mail mitgeteilt.</p>
            <p>15.2 Widerspricht der Kunde den Änderungen nicht innerhalb von 2 Wochen nach Zugang der Ankündigung, gelten die geänderten AGB als angenommen. Auf diese Rechtsfolge wird in der Ankündigung gesondert hingewiesen.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 16 Schlussbestimmungen</h2>
            <p className="mb-2">16.1 Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</p>
            <p className="mb-2">16.2 Erfüllungsort und ausschließlicher Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, Bielefeld.</p>
            <p className="mb-2">16.3 Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
            <p>16.4 Mündliche Nebenabreden bestehen nicht. Änderungen bedürfen der Textform.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#e5e5e5] py-6 px-6 mt-16">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-[#86868b]">
          <Link to="/impressum" className="hover:text-[#1d1d1f] transition-colors">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-[#1d1d1f] transition-colors">Datenschutz</Link>
          <Link to="/agb" className="hover:text-[#1d1d1f] transition-colors">AGB</Link>
          <Link to="/avv" className="hover:text-[#1d1d1f] transition-colors">AVV</Link>
        </div>
      </footer>
    </div>
  );
}
